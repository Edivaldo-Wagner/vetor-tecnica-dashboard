import requests
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets, parsers, generics, status
from .permissions import IsAdminUserCustom
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.db.models import Sum
from .models import (
    Client, ServiceOrder, FinancialRecord, InspectionTemplate, InspectionCategory, 
    InspectionItem, InspectionPhoto, TeamMember, PlatformCompany, Equipment,
    ServiceOrderEquipment, InspectionResponse, ServiceOrderSignature
)
from .serializers import (
    ClientSerializer, ServiceOrderSerializer, FinancialRecordSerializer,
    InspectionTemplateSerializer, InspectionCategorySerializer, InspectionItemSerializer, 
    InspectionPhotoSerializer, TeamMemberSerializer, PlatformCompanySerializer, 
    RegisterSerializer, UserSerializer, EquipmentSerializer
)

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    
    def get_permissions(self):
        # Permite que qualquer utilizador autenticado veja a lista (GET),
        # mas exige o perfil de admin para criar, atualizar ou apagar.
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdminUserCustom()]

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Adiciona os campos diretamente dentro do Token JWT
        token['username'] = user.username
        token['email'] = user.email
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['role'] = getattr(user, 'role', '')
        token['is_superuser'] = user.is_superuser
        token['is_active'] = user.is_active

        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all().order_by('-created_at')
    serializer_class = ClientSerializer

class ServiceOrderViewSet(viewsets.ModelViewSet):
    queryset = ServiceOrder.objects.all().prefetch_related(
        'order_equipments__equipment',
        'order_equipments__template__categories__items',
        'order_equipments__responses'
    ).order_by('-created_at')
    serializer_class = ServiceOrderSerializer

    @action(detail=True, methods=['post'], url_path='execute')
    def execute(self, request, pk=None):
        service_order = self.get_object()

        # 1. Atualizar dados gerais da Ordem de Serviço
        service_order.status = request.data.get('status', 'concluida')
        service_order.complementary_services = request.data.get('complementary_services', service_order.complementary_services)
        service_order.conclusions = request.data.get('conclusions', service_order.conclusions)
        
        if 'check_in' in request.data:
            service_order.check_in = request.data.get('check_in')
        if 'check_out' in request.data:
            service_order.check_out = request.data.get('check_out')

        if 'technicians' in request.data:
            service_order.technicians.set(request.data.get('technicians', []))

        service_order.save()

        # 2. Processar Equipamentos e Respostas do Checklist
        order_equipments = request.data.get('order_equipments', [])
        for eq_data in order_equipments:
            eq_id = eq_data.get('id')
            equipment_id = eq_data.get('equipment')
            template_id = eq_data.get('template')

            if eq_id:
                order_eq = ServiceOrderEquipment.objects.filter(id=eq_id, service_order=service_order).first()
            else:
                order_eq = ServiceOrderEquipment.objects.create(
                    service_order=service_order,
                    equipment_id=equipment_id,
                    template_id=template_id
                )

            if order_eq:
                responses = eq_data.get('responses', [])
                for resp in responses:
                    item_id = resp.get('item')
                    status_val = resp.get('status', 'SIM')
                    value_val = resp.get('value', '')

                    InspectionResponse.objects.update_or_create(
                        order_equipment=order_eq,
                        item_id=item_id,
                        defaults={
                            'status': status_val,
                            'value': value_val
                        }
                    )

        # 3. Processar Assinaturas (Técnico e Cliente) de forma totalmente segura
        signature_data = request.data.get('signature')
        if signature_data:
            try:
                sig_obj, created = ServiceOrderSignature.objects.get_or_create(
                    service_order=service_order
                )
                
                sig_obj.client_name = signature_data.get('client_name', '')
                sig_obj.technician_name = signature_data.get('technician_name', '')
                sig_obj.save()

                import base64
                from django.core.files.base import ContentFile

                # Cliente
                client_sig_b64 = signature_data.get('client_signature')
                if client_sig_b64 and isinstance(client_sig_b64, str) and 'data:image' in client_sig_b64:
                    try:
                        # Extrai a string base64 de forma limpa, ignorando o cabeçalho exato
                        imgstr = client_sig_b64.split(';base64,')[1]
                        sig_obj.client_signature.save(
                            f"client_sig_{service_order.id}.png", 
                            ContentFile(base64.b64decode(imgstr)), 
                            save=True
                        )
                    except Exception as e:
                        import traceback
                        traceback.print_exc()
                        print("Erro detalhado ao salvar imagem do cliente:", e)

                # Técnico
                tech_sig_b64 = signature_data.get('technician_signature')
                if tech_sig_b64 and isinstance(tech_sig_b64, str) and 'data:image' in tech_sig_b64:
                    try:
                        imgstr = tech_sig_b64.split(';base64,')[1]
                        sig_obj.technician_signature.save(
                            f"tech_sig_{service_order.id}.png", 
                            ContentFile(base64.b64decode(imgstr)), 
                            save=True
                        )
                    except Exception as e:
                        import traceback
                        traceback.print_exc()
                        print("Erro detalhado ao salvar imagem do técnico:", e)

            except Exception as sig_err:
                import traceback
                traceback.print_exc()
                print("Erro geral ao processar assinaturas:", sig_err)

        # Retorna o sucesso da operação para o frontend
        serializer = self.get_serializer(service_order)
        return Response(serializer.data, status=status.HTTP_200_OK)


        # ==========================================
        # INTEGRAÇÃO ZAPSIGN COMENTADA (GUARDADA PARA O FUTURO)
        # ==========================================
        
        # 4. Integração com a ZapSign para Assinatura do Cliente
        client_email = service_order.client.contact_email or service_order.client.access_email or "cliente@exemplo.com"
        client_name = (signature_data and signature_data.get('client_name')) or service_order.client.name

        #import io
        #import base64
        #from reportlab.lib.pagesizes import letter
        #from reportlab.pdfgen import canvas

        #buffer = io.BytesIO()
        #p = canvas.Canvas(buffer, pagesize=letter)
        
        #p.setFont("Helvetica-Bold", 14)
        #p.drawString(50, 750, f"RELATÓRIO DE EXECUÇÃO - O.S. #{service_order.os_number}")
        
        #p.setFont("Helvetica", 10)
        #p.drawString(50, 725, f"Cliente: {service_order.client.name}")
        #p.drawString(50, 710, f"Escopo: {service_order.scope or 'N/A'}")
        #p.drawString(50, 695, f"Serviços Complementares: {service_order.complementary_services or 'N/A'}")
        #p.drawString(50, 680, f"Conclusões: {service_order.conclusions or 'N/A'}")
        
        #p.drawString(50, 630, "Documento gerado automaticamente pelo sistema de gestão.")
        #p.showPage()
        #p.save()

        #buffer.seek(0)
        #pdf_b64_encoded = base64.b64encode(buffer.read()).decode('utf-8')

        #payload = {
        #    "name": f"Relatório de Execução - O.S. #{service_order.os_number}",
        #    "sandbox": True,
        #    "base64_pdf": pdf_b64_encoded,
        #    "signers": [
        #        {
        #            "name": client_name,
        #            "email": client_email,
        #            "auth_mode": "token"
        #        }
        #    ]
        #}

        #headers = {
        #    "Authorization": f"Bearer {settings.ZAPSIGN_API_TOKEN}",
        #    "Content-Type": "application/json"
        #}

        #try:
        #    url_zapsign = f"{settings.ZAPSIGN_API_URL}/docs/?token={settings.ZAPSIGN_API_TOKEN}"
        #    response = requests.post(url_zapsign, json=payload, headers=headers)

        #    if response.status_code in [200, 201]:
        #        res_data = response.json()
        #        service_order.zapsign_doc_token = res_data.get('token')
        #        service_order.client_sign_url = res_data['signers'][0].get('sign_url')
        #        service_order.is_zapsign_signed = False
        #        service_order.save()

                # Tenta consultar o documento na ZapSign para ver se já existe imagem de assinatura
       #         doc_token = res_data.get('token')
       #         if doc_token:
       #             url_detalhe = f"{settings.ZAPSIGN_API_URL}/docs/{doc_token}/?token={settings.ZAPSIGN_API_TOKEN}"
       #             resp_detalhe = requests.get(url_detalhe)
       #             if resp_detalhe.status_code == 200:
       #                 doc_info = resp_detalhe.json()
       #                 signers_list = doc_info.get('signers', [])
       #                 if signers_list and sig_obj:
       #                     sig_image_url = signers_list[0].get('signature_image')
       #                     if sig_image_url:
       #                         try:
       #                             import urllib.request
       #                             from django.core.files.base import ContentFile
       #                             req_img = urllib.request.urlopen(sig_image_url)
       #                             sig_obj.client_signature.save(f"client_sig_{service_order.id}.png", ContentFile(req_img.read()), save=True)
       #                         except Exception as img_err:
       #                             print("Erro ao descarregar imagem da ZapSign:", img_err)
       # except Exception as e:
       #     print("Erro ao comunicar com a ZapSign:", e)

        #serializer = self.get_serializer(service_order)
        #return Response(serializer.data, status=status.HTTP_200_OK)

    #@action(detail=True, methods=['get'], url_path='sync-signature')
    #def sync_signature(self, request, pk=None):
    #    service_order = self.get_object()
        
    #    if not service_order.zapsign_doc_token:
    #        return Response({"error": "Esta O.S. não possui token da ZapSign."}, status=400)

        # URL limpa sem expor o token na query string
    #    url_zapsign = f"{settings.ZAPSIGN_API_URL}/docs/{service_order.zapsign_doc_token}/"
        
        # Cabeçalho obrigatório com Bearer Token (exatamente como funcionou no curl)
    #    headers = {
    #        "Authorization": f"Bearer {settings.ZAPSIGN_API_TOKEN}",
    #        "Content-Type": "application/json"
    #    }
        
    #    try:
    #        response = requests.get(url_zapsign, headers=headers)

    #        if response.status_code == 200:
    #            doc_data = response.json()
    #            signers = doc_data.get('signers', [])
                
    #            if signers:
    #                signer = signers[0]
    #                sig_image_url = signer.get('signature_image')
                    
    #                if sig_image_url:
    #                    sig_obj, _ = ServiceOrderSignature.objects.get_or_create(service_order=service_order)
                        
    #                    import urllib.request
    #                    from django.core.files.base import ContentFile
                        
    #                    req_img = urllib.request.urlopen(sig_image_url)
    #                    sig_obj.client_signature.save(
    #                        f"client_sig_{service_order.id}.png", 
    #                        ContentFile(req_img.read()), 
    #                        save=True
    #                    )
                        
                        # Devolve os dados atualizados da O.S. para o frontend exibir a imagem fresca
    #                    serializer = self.get_serializer(service_order, context={'request': request})
    #                    return Response(serializer.data, status=status.HTTP_200_OK)
            
    #        return Response({"error": "Ainda não há imagem de assinatura disponível na ZapSign."}, status=400)
    #    except Exception as e:
    #        return Response({"error": str(e)}, status=500)

class FinancialRecordViewSet(viewsets.ModelViewSet):
    queryset = FinancialRecord.objects.all().order_by('-created_at')
    serializer_class = FinancialRecordSerializer

class InspectionTemplateViewSet(viewsets.ModelViewSet):
    queryset = InspectionTemplate.objects.all().order_by('-created_at')
    serializer_class = InspectionTemplateSerializer

class InspectionCategoryViewSet(viewsets.ModelViewSet):
    queryset = InspectionCategory.objects.all()
    serializer_class = InspectionCategorySerializer

class InspectionItemViewSet(viewsets.ModelViewSet):
    queryset = InspectionItem.objects.all()
    serializer_class = InspectionItemSerializer

class InspectionPhotoViewSet(viewsets.ModelViewSet):
    queryset = InspectionPhoto.objects.all()
    serializer_class = InspectionPhotoSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TeamMemberViewSet(viewsets.ModelViewSet):
    queryset = TeamMember.objects.all().order_by('-created_at')
    serializer_class = TeamMemberSerializer

class PlatformCompanyViewSet(viewsets.ModelViewSet):
    queryset = PlatformCompany.objects.all().order_by('-created_at')
    serializer_class = PlatformCompanySerializer

    @action(detail=False, methods=['get'])
    def stats(self, request):
        active_companies = PlatformCompany.objects.filter(status='ativa').count()
        total_users = PlatformCompany.objects.aggregate(Sum('users_count'))['users_count__sum'] or 0
        monthly_revenue = PlatformCompany.objects.filter(status='ativa').aggregate(Sum('monthly_fee'))['monthly_fee__sum'] or 0
        trial_companies = PlatformCompany.objects.filter(status='trial').count()

        if monthly_revenue >= 1000:
            formatted_mrr = f"R$ {monthly_revenue / 1000:.1f}k".replace(".", ",")
        else:
            formatted_mrr = f"R$ {monthly_revenue:.2f}"

        stats_data = [
            {"title": "Empresas Ativas", "value": active_companies},
            {"title": "Utilizadores Totais", "value": total_users},
            {"title": "MRR (Receita Mensal)", "value": formatted_mrr},
            {"title": "Empresas em Trial", "value": trial_companies},
        ]
        return Response(stats_data, status=status.HTTP_200_OK)

class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all().order_by('-created_at')
    serializer_class = EquipmentSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        client_id = self.request.query_params.get('client')
        if client_id:
            queryset = queryset.filter(client_id=client_id)
        return queryset