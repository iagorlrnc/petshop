-- Seed data for services table with fictional items for petshop
-- This file contains sample services for testing the admin panel
-- NOTE: Execute the migration first to create the services table

INSERT INTO services (name, description, price_small, price_medium, price_large, duration_minutes, icon, is_active)
VALUES
  (
    'Banho Simples',
    'Lavagem completa com shampoo neutro e condicionador. Ideal para limpeza geral do pet.',
    45.00,
    65.00,
    90.00,
    60,
    'droplet',
    true
  ),
  (
    'Tosa Higiênica',
    'Corte higiênico nas patas, barriga e região íntima. Mantém o pet limpo e confortável.',
    55.00,
    75.00,
    105.00,
    45,
    'scissors',
    true
  ),
  (
    'Banho e Tosa Completa',
    'Pacote completo com banho, secagem e tosa estética. O pet sai impecável!',
    85.00,
    120.00,
    170.00,
    120,
    'scissors',
    true
  ),
  (
    'Hidratação Profunda',
    'Tratamento profundo com máscara hidratante e enxágue com água filtrada.',
    70.00,
    95.00,
    130.00,
    40,
    'sparkles',
    true
  ),
  (
    'Limpeza de Ouvidos',
    'Remoção de cerume e limpeza delicada dos canais auditivos com solução específica.',
    30.00,
    35.00,
    40.00,
    20,
    'ear',
    true
  ),
  (
    'Corte de Unhas',
    'Aparagem e lixamento das unhas do pet com ponta de segurança.',
    25.00,
    30.00,
    35.00,
    15,
    'nail',
    true
  ),
  (
    'Consulta Veterinária',
    'Avaliação clínica completa com veterinário para diagnóstico e orientação.',
    120.00,
    120.00,
    140.00,
    30,
    'stethoscope',
    true
  ),
  (
    'Vacinação',
    'Aplicação de vacinas de rotina com registro em carteirinha do pet.',
    80.00,
    80.00,
    80.00,
    15,
    'syringe',
    true
  ),
  (
    'Banho Medicado',
    'Banho com shampoo medicado para alergias, dermatites e coceiras.',
    65.00,
    85.00,
    115.00,
    50,
    'droplet',
    true
  ),
  (
    'Tosa Estética Personalizada',
    'Corte personalizado conforme raça e preferência do tutor. Criatividade garantida!',
    95.00,
    140.00,
    190.00,
    90,
    'scissors',
    true
  ),
  (
    'Tratamento Anti-pulgas',
    'Banho específico com produto anti-pulgas e limpeza profunda.',
    50.00,
    70.00,
    95.00,
    60,
    'bug',
    true
  ),
  (
    'Desembaraço de Pelagem',
    'Remoção de nós e emaranhados com condicionador profissional.',
    40.00,
    60.00,
    85.00,
    45,
    'sparkles',
    true
  ),
  (
    'Pintura e Coloração Segura',
    'Pintura temporária com tinta não-tóxica para deixar seu pet estiloso.',
    75.00,
    95.00,
    120.00,
    60,
    'palette',
    true
  ),
  (
    'Massagem Relaxante',
    'Massagem terapêutica para aliviar tensões e melhorar circulação.',
    55.00,
    70.00,
    85.00,
    40,
    'hand',
    true
  ),
  (
    'Hotelaria Pet (Diária)',
    'Hospedagem confortável com alimentação, recreação e cuidados 24h.',
    100.00,
    100.00,
    100.00,
    1440,
    'dog',
    true
  );
