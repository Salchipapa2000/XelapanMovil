namespace AgroCosechaMovil.Models;

// Un insumo agrícola del catálogo de Agroservicio La Cosecha
public record Insumo(
    int Id,
    string Nombre,
    string Categoria,
    string Unidad, // &quot;saco 45 kg&quot;, &quot;libra&quot;, &quot;litro&quot;, &quot;unidad&quot;...
    decimal Precio, // precio en quetzales por unidad
    int Existencias); // unidades disponibles en bodega