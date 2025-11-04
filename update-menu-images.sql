-- Inserir alguns itens de menu com imagens de exemplo para testar

-- Primeiro, vamos verificar a estrutura atual
SELECT id, nome, imagem FROM menu_items LIMIT 5;

-- Atualizar alguns itens com URLs de imagens de exemplo
UPDATE menu_items 
SET imagem = '/api/images/menu/hamburguer-classico.jpg'
WHERE nome ILIKE '%hamburguer%' OR nome ILIKE '%burger%'
LIMIT 1;

UPDATE menu_items 
SET imagem = '/api/images/menu/pizza-margherita.jpg'
WHERE nome ILIKE '%pizza%'
LIMIT 1;

UPDATE menu_items 
SET imagem = '/api/images/menu/refrigerante-cola.jpg'
WHERE nome ILIKE '%coca%' OR nome ILIKE '%refrigerante%'
LIMIT 1;

UPDATE menu_items 
SET imagem = '/api/images/menu/batata-frita.jpg'
WHERE nome ILIKE '%batata%'
LIMIT 1;

-- Verificar as atualizações
SELECT id, nome, imagem FROM menu_items WHERE imagem IS NOT NULL;