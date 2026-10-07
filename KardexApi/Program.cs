using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using KardexApi.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Configurar BD
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Configurar JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
    };
});

// --- AQUÍ SE AGREGAN LOS SERVICIOS DE NEGOCIO ---
builder.Services.AddScoped<KardexApi.Services.ProductoService>();
builder.Services.AddScoped<KardexApi.Services.CompraService>();
builder.Services.AddScoped<KardexApi.Services.VentaService>();
builder.Services.AddScoped<KardexApi.Services.KardexService>(); // <- Servicio de Kardex
// -----------------------------------------------

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 3. Configurar Swagger para usar JWT
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Ingresa 'Bearer' [espacio] y luego tu token."
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement {
        {
            new OpenApiSecurityScheme {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new string[] {}
        }
    });
});

// 4. Configurar CORS (Requisito 2.1.1: Permitir consumo por Frontend)
builder.Services.AddCors(options =>
{
    options.AddPolicy("NuevaPolitica", app => 
    {
        app.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("NuevaPolitica");
app.UseHttpsRedirection();

// Habilitar la autenticación antes de la autorización
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();