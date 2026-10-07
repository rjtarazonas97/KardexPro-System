-- 1. Crear la Base de Datos
CREATE DATABASE SistemaKardexDB;
GO

USE SistemaKardexDB;
GO

-- 2. Crear Tabla Productos
CREATE TABLE Productos (
    Id_producto INT IDENTITY(1,1) PRIMARY KEY,
    Nombre_producto VARCHAR(100) NOT NULL,
    NroLote VARCHAR(50),
    Fec_registro DATETIME DEFAULT GETDATE(),
    Costo DECIMAL(10,2) NOT NULL,
    PrecioVenta DECIMAL(10,2) NOT NULL
);
GO

-- 3. Crear Tabla CompraCab
CREATE TABLE CompraCab (
    Id_CompraCab INT IDENTITY(1,1) PRIMARY KEY,
    FecRegistro DATETIME DEFAULT GETDATE(),
    SubTotal DECIMAL(10,2) NOT NULL,
    Igv DECIMAL(10,2) NOT NULL,
    Total DECIMAL(10,2) NOT NULL
);
GO

-- 4. Crear Tabla CompraDet
CREATE TABLE CompraDet (
    Id_CompraDet INT IDENTITY(1,1) PRIMARY KEY,
    Id_CompraCab INT FOREIGN KEY REFERENCES CompraCab(Id_CompraCab),
    Id_producto INT FOREIGN KEY REFERENCES Productos(Id_producto),
    Cantidad INT NOT NULL,
    Precio DECIMAL(10,2) NOT NULL,
    Sub_Total DECIMAL(10,2) NOT NULL,
    Igv DECIMAL(10,2) NOT NULL,
    Total DECIMAL(10,2) NOT NULL
);
GO

-- 5. Crear Tabla Ventacab
CREATE TABLE VentaCab (
    Id_VentaCab INT IDENTITY(1,1) PRIMARY KEY,
    fecRegistro DATETIME DEFAULT GETDATE(),
    SubTotal DECIMAL(10,2) NOT NULL,
    Igv DECIMAL(10,2) NOT NULL,
    Total DECIMAL(10,2) NOT NULL
);
GO

-- 6. Crear Tabla VentaDet
CREATE TABLE VentaDet (
    Id_VentaDet INT IDENTITY(1,1) PRIMARY KEY,
    Id_VentaCab INT FOREIGN KEY REFERENCES VentaCab(Id_VentaCab),
    Id_producto INT FOREIGN KEY REFERENCES Productos(Id_producto),
    Cantidad INT NOT NULL,
    Precio DECIMAL(10,2) NOT NULL,
    Sub_Total DECIMAL(10,2) NOT NULL,
    Igv DECIMAL(10,2) NOT NULL,
    Total DECIMAL(10,2) NOT NULL
);
GO

-- 7. Crear Tabla MovimientoCab (Kardex)
CREATE TABLE MovimientoCab (
    Id_MovimientoCab INT IDENTITY(1,1) PRIMARY KEY,
    Fec_registro DATETIME DEFAULT GETDATE(),
    Id_TipoMovimiento INT NOT NULL, -- (1) Entrada , (2) Salida
    Id_DocumentoOrigen INT NOT NULL -- ID de CompraCab o VentaCab
);
GO

-- 8. Crear Tabla Movimientodet
CREATE TABLE MovimientoDet (
    Id_MovimientoDet INT IDENTITY(1,1) PRIMARY KEY,
    Id_movimientocab INT FOREIGN KEY REFERENCES MovimientoCab(Id_MovimientoCab),
    Id_Producto INT FOREIGN KEY REFERENCES Productos(Id_producto),
    Cantidad INT NOT NULL
);
GO