from rest_framework import viewsets, parsers, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from .models import Client, ServiceOrder, FinancialRecord, InspectionCategory, InspectionItem, InspectionPhoto, TeamMember, PlatformCompany
from .serializers import (
    ClientSerializer, ServiceOrderSerializer, FinancialRecordSerializer,
    InspectionCategorySerializer, InspectionItemSerializer, InspectionPhotoSerializer, TeamMemberSerializer, PlatformCompanySerializer
)

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all().order_by('-created_at')
    serializer_class = ClientSerializer

class ServiceOrderViewSet(viewsets.ModelViewSet):
    queryset = ServiceOrder.objects.all().order_by('-created_at')
    serializer_class = ServiceOrderSerializer

class FinancialRecordViewSet(viewsets.ModelViewSet):
    queryset = FinancialRecord.objects.all().order_by('-created_at')
    serializer_class = FinancialRecordSerializer

class InspectionCategoryViewSet(viewsets.ModelViewSet):
    queryset = InspectionCategory.objects.all().order_by('created_at')
    serializer_class = InspectionCategorySerializer

class InspectionItemViewSet(viewsets.ModelViewSet):
    queryset = InspectionItem.objects.all()
    serializer_class = InspectionItemSerializer

class InspectionPhotoViewSet(viewsets.ModelViewSet):
    queryset = InspectionPhoto.objects.all()
    serializer_class = InspectionPhotoSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]  # Suporte para envio de imagens

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
            {
                "title": "EMPRESAS ATIVAS",
                "value": str(active_companies),
                "subtext": "clientes pagantes",
                "highlight": True,
            },
            {
                "title": "USUÁRIOS",
                "value": str(total_users),
                "subtext": "em todas as contas",
                "highlight": True,
            },
            {
                "title": "RECEITA MENSAL",
                "value": formatted_mrr,
                "subtext": "MRR estimado",
                "isGreen": True,
            },
            {
                "title": "EM TESTE",
                "value": str(trial_companies),
                "subtext": "trial terminando em 7 dias",
                "highlight": True,
            },
        ]
        return Response(stats_data)