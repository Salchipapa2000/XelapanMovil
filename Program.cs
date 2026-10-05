using AgroCosechaMovil.Models;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

var insumos = new List<Insumo>
{
    new(1, "Semilla de maíz ICTA HB-83", "Semillas", "bolsa 10 lb", 185.00m, 40),
    new(2, "Semilla de frijol negro ICTA", "Semillas", "libra", 12.50m, 120),
    new(3, "Fertilizante 15-15-15", "Fertilizantes", "saco 45 kg", 295.00m, 25),
    new(4, "Urea 46 %", "Fertilizantes", "saco 45 kg", 310.00m, 8),
    new(5, "Abono orgánico (bocashi)", "Fertilizantes", "saco 25 kg", 65.00m, 60),
    new(6, "Machete 22 pulgadas", "Herramientas", "unidad", 55.00m, 30),
    new(7, "Bomba de mochila 16 L", "Herramientas", "unidad", 425.00m, 5),
    new(8, "Fungicida a base de cobre", "Protección", "kilogramo", 98.00m, 18),
};
var cotizaciones = new List<Cotizacion>();

// GET /api/insumos?categoria=Semillas (el filtro es opcional)
app.MapGet("/api/insumos", (string? categoria) =>
    string.IsNullOrWhiteSpace(categoria)
        ? insumos
        : insumos.Where(i => i.Categoria.Equals(categoria,StringComparison.OrdinalIgnoreCase)).ToList());

// GET /api/insumos/3
app.MapGet("/api/insumos/{id:int}", (int id) =>
    insumos.FirstOrDefault(i => i.Id == id) is Insumo i
        ? Results.Ok(i)
        : Results.NotFound(new { mensaje = $"No existe el insumo {id}" }));

// ===== PARTE 1: tu código va aquí =====
// app.MapPost("/api/cotizaciones", (CotizacionNueva datos) => { ... });
// app.MapGet("/api/cotizaciones", () => ...);

app.Run();