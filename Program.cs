// Program.cs — Servicio web + app web móvil de Café Xelapán
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// 1) Archivos estáticos: sirve la app móvil que está en la carpeta wwwroot
app.UseDefaultFiles(); // "/" devuelve wwwroot/index.html
app.UseStaticFiles(); // permite descargar .html, .css, .js, .json, imágenes

// 2) "Base de datos" en memoria (en la Semana 9 usamos ADO.NET + SQL Server)
var productos = new List<Producto>
{
    new(1, "Café de olla", "Bebidas calientes", 15.00m),
    new(2, "Capuchino", "Bebidas calientes", 20.00m),
    new(3, "Chocolate Xelajú", "Bebidas calientes", 18.00m),
    new(4, "Frappé de café", "Bebidas frías", 25.00m),
    new(5, "Licuado de banano", "Bebidas frías", 16.00m),
    new(6, "Pan de manteca", "Panadería", 3.50m),
    new(7, "Champurradas (3)", "Panadería", 6.00m),
    new(8, "Shecas", "Panadería", 4.00m),
    new(9, "Tamal Colorado", "Comida", 12.00m),
};
var pedidos = new List<Pedido>();

// 3) Endpoints del servicio web REST (mismo estilo que la Semana 10)
app.MapGet("/api/productos", () => productos);

app.MapGet("/api/productos/{id:int}", (int id) =>
    productos.FirstOrDefault(p => p.Id == id) is Producto p
        ? Results.Ok(p)
        : Results.NotFound(new { mensaje = $"No existe el producto {id}" }));

app.MapPost("/api/pedidos", (PedidoNuevo datos) =>
{
    // Validaciones del lado del servidor: nunca confiar solo en el navegador
    if (string.IsNullOrWhiteSpace(datos.Cliente))
    return Results.BadRequest(new { mensaje = "El nombre del cliente es obligatorio." });
    if (datos.Items is null || datos.Items.Count == 0)
    return Results.BadRequest(new { mensaje = "El pedido no tiene productos." });

    decimal total = 0;
    foreach (var item in datos.Items)
    {
        var prod = productos.FirstOrDefault(p => p.Id == item.ProductoId);
        if (prod is null || item.Cantidad <= 0)
        return Results.BadRequest(new { mensaje = $"Ítem inválido: producto {item.ProductoId}" });
        total += prod.Precio * item.Cantidad; // el total se calcula en el servidor
    }

    var pedido = new Pedido(pedidos.Count + 1, datos.Cliente.Trim(), datos.Items, total, DateTime.Now);
    pedidos.Add(pedido);
    return Results.Created($"/api/pedidos/{pedido.Id}", pedido); // 201 Created
});

app.MapGet("/api/pedidos", () => pedidos);

app.Run();

// 4) Modelos (records de C#): deben ir DESPUÉS de las instrucciones de nivel superior
record Producto(int Id, string Nombre, string Categoria, decimal Precio);
record ItemPedido(int ProductoId, int Cantidad);
record PedidoNuevo(string Cliente, List<ItemPedido> Items);
record Pedido(int Id, string Cliente, List<ItemPedido> Items, decimal Total, DateTime Fecha);