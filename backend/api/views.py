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
    permission_classes = [IsAdminUserCustom]

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
    queryset = ServiceOrder.objects.all().order_by('-created_at')
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

        # Se forem passados técnicos na execução, atualiza o vínculo ManyToMany
        if 'technicians' in request.data:
            service_order.technicians.set(request.data.get('technicians', []))

        service_order.save()

        # 2. Processar Equipamentos e Respostas do Checklist
        order_equipments = request.data.get('order_equipments', [])
        for eq_data in order_equipments:
            eq_id = eq_data.get('id')
            equipment_id = eq_data.get('equipment')
            template_id = eq_data.get('template')

            # Cria ou obtém a relação do equipamento com a O.S.
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

                    # Atualiza se já existir ou cria uma nova resposta
                    InspectionResponse.objects.update_or_create(
                        order_equipment=order_eq,
                        item_id=item_id,
                        defaults={
                            'status': status_val,
                            'value': value_val
                        }
                    )

        # 3. Processar Assinatura (se for enviada no payload)
        signature_data = request.data.get('signature')
        if signature_data:
            ServiceOrderSignature.objects.update_or_create(
                service_order=service_order,
                defaults={
                    'client_name': signature_data.get('client_name', ''),
                    'technician_name': signature_data.get('technician_name', '')
                }
            )

        serializer = self.get_serializer(service_order)
        return Response(serializer.data, status=status.HTTP_200_OK)

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