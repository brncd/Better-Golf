FROM mcr.microsoft.com/dotnet/sdk:9.0 as development

WORKDIR /app

RUN dotnet tool install --global dotnet-ef --version 9.0.8

ENV PATH="$PATH:/root/.dotnet/tools"

EXPOSE 5001

CMD ["dotnet", "run"]
