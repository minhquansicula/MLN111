FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Install Node.js for frontend build
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get install -y nodejs

# Copy source code
COPY . .

# Install dependencies and build
RUN npm install
RUN npm run setup
RUN npm run build

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/.artifacts/publish .

# Expose standard port for web apps
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "ViralGame.Server.dll"]
