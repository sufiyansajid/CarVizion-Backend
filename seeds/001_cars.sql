INSERT INTO cars (id, name, path, type, description, thumbnail) VALUES
('standard', 'Ford Raptor', '/models/FordRaptor.glb', 'suv', 'Powerful off-road performance truck.', '/images/cars/sedan-thumb.png'),
('sport', 'Genesis Sport GT', '/models/McLaren600LT.glb', 'sport', 'Performance tuned version with aerodynamic kit.', '/images/cars/sport-thumb.png'),
('porsche', 'Porsche 911', '/models/Porsche911.glb', 'sport', 'Iconic sports car with precision handling.', '/images/cars/porsche-thumb.png'),
('honda_city', 'Honda City', '/models/HondaCity.glb', 'sedan', 'Reliable and efficient urban sedan.', '/images/cars/sedan-thumb.png')
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    path = VALUES(path),
    type = VALUES(type),
    description = VALUES(description),
    thumbnail = VALUES(thumbnail);
