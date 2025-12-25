# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copy csproj and restore as distinct layers
COPY src/Baterias.Api/Baterias.Api.csproj ./src/Baterias.Api/
COPY src/Baterias.Application/Baterias.Application.csproj ./src/Baterias.Application/
COPY src/Baterias.Domain/Baterias.Domain.csproj ./src/Baterias.Domain/
COPY src/Baterias.Infrastructure/Baterias.Infrastructure.csproj ./src/Baterias.Infrastructure/

RUN dotnet restore ./src/Baterias.Api/Baterias.Api.csproj

# Copy everything else and build
COPY src/ ./src/
WORKDIR /app/src/Baterias.Api
RUN dotnet publish -c Release -o /app/out

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/out .

# Configuration for Render/Production
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "Baterias.Api.dll"]
