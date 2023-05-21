import query from '../../database/query.js';
import CustomError from '../../utils/customError.js';

const newInventoryElement = async ({
  material, fabric, product, size, quantity,
}) => {
  const sql = `INSERT INTO inventory(material, fabric, product, "size", quantity)
              VALUES($1,$2,$3,$4,$5) RETURNING id_inventory as id;`;

  try {
    const { result, rowCount } = await query(
      sql,
      material,
      fabric,
      product,
      size,
      quantity,
    );

    if (rowCount !== 1) throw new CustomError('No se pudo agregar el elemento al inventario', 500);

    return result[0];
  } catch (err) {
    if (err instanceof CustomError) throw err;

    if (err?.constraint === 'check_element') {
      throw new CustomError('Solo puede agregar un tipo de elemento a la vez.', 400);
    }
    const error = 'Datos no válidos.';

    throw new CustomError(error, 400);
  }
};

const getInventory = async (searchQuery) => {
  let queryResult;
  if (searchQuery) {
    const sql = `select id_inventory, COALESCE(mat.description, f.fabric,
                CONCAT(pt.name, ' talla ', s.size, ' color ', prod.color, ' de ', co.name)) "element",
                quantity
                from inventory i
                left join material mat on i.material = mat.id_material
                left join fabric f on i.fabric = f.id_fabric
                left join product prod on i.product = prod.id_product
                left join product_type pt on prod.type = pt.id_product_type
                left join client_organization co on prod.client = co.id_client_organization
                left join "size" s on i.size = s.id_size
                where prod.id_product ilike '%%' or prod.client ilike '%%'
                  or mat.id_material ilike '%%' or f.id_fabric ilike '%%'
                  or COALESCE(mat.description, f.fabric,
                    CONCAT(pt.name, ' talla ', s.size, ' color ', prod.color, ' de ', co.name)) ilike '%%';`;
    queryResult = await query(sql, `%${searchQuery}%`);
  } else {
    const sql = `select id_inventory, COALESCE(mat.description, f.fabric,
                CONCAT(pt.name, ' talla ', s.size, ' color ', prod.color, ' de ', co.name)) "element",
                quantity
                from inventory i
                left join material mat on i.material = mat.id_material
                left join fabric f on i.fabric = f.id_fabric
                left join product prod on i.product = prod.id_product
                left join product_type pt on prod.type = pt.id_product_type
                left join client_organization co on prod.client = co.id_client_organization
                left join "size" s on i.size = s.id_size`;
    queryResult = await query(sql);
  }

  const { result, rowCount } = queryResult;

  if (rowCount === 0) throw new CustomError('No se encontraron resultados.', 404);

  return result.map((val) => ({
    id: val.id_inventory,
    element: val.element,
    quantity: val.quantity,
  }));
};

export {
  getInventory,
  newInventoryElement,
};