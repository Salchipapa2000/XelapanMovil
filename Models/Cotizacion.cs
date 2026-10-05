namespace AgroCosechaMovil.Models;

// Lo que envía el celular (POST /api/cotizaciones)
public record ItemCotizacion(int InsumoId, int Cantidad);
public record CotizacionNueva(string Cliente, string Telefono, List<ItemCotizacion> Items);

// Lo que el servidor guarda y devuelve
public record Cotizacion(
    int Id, string Cliente, string Telefono, List<ItemCotizacion> Items,
    decimal Subtotal, decimal Descuento, decimal Total, DateTime Fecha);