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

//agregamos lo solicitado.
app.MapPost("/api/cotizaciones", (CotizacionNueva datos) =>
{
    // Validar cliente
    if (string.IsNullOrWhiteSpace(datos.Cliente))
    {
        return Results.BadRequest(new
        {
            mensaje = "El cliente no puede estar vacío"
        });
    }

    // Validar teléfono: exactamente 8 dígitos numéricos
    if (string.IsNullOrWhiteSpace(datos.Telefono) ||
        datos.Telefono.Length != 8 ||
        !datos.Telefono.All(char.IsDigit))
    {
        return Results.BadRequest(new
        {
            mensaje = "El teléfono debe tener exactamente 8 dígitos numéricos"
        });
    }

    // Validar que existan ítems
    if (datos.Items == null || datos.Items.Count == 0)
    {
        return Results.BadRequest(new
        {
            mensaje = "La cotización debe tener al menos un ítem"
        });
    }

    decimal subtotal = 0;

    // Validar cada ítem y calcular subtotal
    foreach (var item in datos.Items)
    {
        // Buscar el insumo
        var insumo = insumos.FirstOrDefault(i => i.Id == item.InsumoId);

        // El insumo no existe
        if (insumo == null)
        {
            return Results.BadRequest(new
            {
                mensaje = $"No existe el insumo {item.InsumoId}"
            });
        }

        // La cantidad debe ser mayor que 0
        if (item.Cantidad <= 0)
        {
            return Results.BadRequest(new
            {
                mensaje = $"La cantidad de {insumo.Nombre} debe ser mayor que 0"
            });
        }

        // Verificar existencias
        if (item.Cantidad > insumo.Existencias)
        {
            return Results.BadRequest(new
            {
                mensaje = $"Solo hay {insumo.Existencias} de {insumo.Nombre}"
            });
        }

        // Calcular subtotal en el servidor
        subtotal += insumo.Precio * item.Cantidad;
    }

    // Redondear subtotal a 2 decimales
    subtotal = Math.Round(subtotal, 2);

    // Aplicar descuento del 5 % si el subtotal es >= Q1,000
    decimal descuento = subtotal >= 1000
        ? Math.Round(subtotal * 0.05m, 2)
        : 0m;

    // Calcular total
    decimal total = Math.Round(subtotal - descuento, 2);

    // Crear la cotización
    var cotizacion = new Cotizacion(
        cotizaciones.Count + 1,
        datos.Cliente,
        datos.Telefono,
        datos.Items,
        subtotal,
        descuento,
        total,
        DateTime.Now
    );

    // Guardar la cotización
    cotizaciones.Add(cotizacion);

    // Responder 201 Created
    return Results.Created(
        $"/api/cotizaciones/{cotizacion.Id}",
        cotizacion
    );
});


// GET /api/cotizaciones
app.MapGet("/api/cotizaciones", () => cotizaciones);

app.Run();