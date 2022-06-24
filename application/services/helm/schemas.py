"""
Helm schemas.
"""
from datetime import datetime
from datetime import timezone
from typing import Optional

from pydantic import BaseModel
from pydantic import Field

from application.constants.helm import ReleaseStatuses


class helm_datetime(datetime):
    @classmethod
    def __get_validators__(cls):
        yield cls.parse_datetime

    @classmethod
    def parse_datetime(cls, value: str) -> datetime:
        """
        Parses date time that sends us helm.

        Value example: '2022-06-01 12:46:15.24955073 +0000 UTC'
                       '2022-06-07 16:13:40.907107 +0300 +0300'
        """
        # Reducing microseconds count to 6 by cutting redundant digits.
        # Helm returns time with 8 digits in microseconds Python supports only 6.
        date_parts = list(value.split())
        date_parts[1] = date_parts[1][:15]
        # Removing time zone. Sometimes date contains Time zone as UTC sometimes
        # as +0300. It breaks parsing of date.
        fixed_value = ' '.join(date_parts[:-1])

        parsed_datetime = datetime.strptime(fixed_value, '%Y-%m-%d %H:%M:%S.%f %z')
        # Setting UTC time zone manually.
        parsed_datetime.replace(tzinfo=timezone.utc)
        return parsed_datetime


class ReleaseSchema(BaseModel):
    """
    Helm release response.
    """
    application_version: str = Field(alias='app_version', description='Application version')
    chart: str = Field(description='Used chart name')
    name: str = Field(description='Release name')
    namespace: str = Field(description='Namespace')
    revision: str = Field(description='Revision number')
    status: ReleaseStatuses = Field(description='Status')
    updated: helm_datetime = Field(description='Release last update date')

    class Config:
        allow_population_by_field_name = True


class ManifestMetaSchema(BaseModel):
    name: str = Field(description='Entity name')
    namespace: Optional[str] = Field(description='Namespace to which belongs entity')
    labels: Optional[dict] = Field(default={}, description='Custom defined labels in form key-value')


class ManifestSchema(BaseModel):
    """
    Entity manifest.
    """
    api_version: str = Field(alias='apiVersion', description='API version')
    kind: str = Field(description='Type of entity')
    metadata: ManifestMetaSchema = Field(description='Entity metadata')
    specification: Optional[dict] = Field(alias='spec', default={}, description='Entity technical specification')

    class Config:
        allow_population_by_field_name = True
