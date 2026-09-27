from django.contrib import admin
from .models import (
    Client, 
    InspectionCategory, 
    InspectionItem, 
    InspectionPhoto, 
    TeamMember, 
    PlatformCompany
)

# Registo simples dos modelos
admin.site.register(Client)
admin.site.register(InspectionCategory)
admin.site.register(InspectionItem)
admin.site.register(InspectionPhoto)
admin.site.register(TeamMember)
admin.site.register(PlatformCompany)