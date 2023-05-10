import query from '../../database/query.js';
import CustomError from '../../utils/customError.js';

const newOrderRequest = async ({
  name, email, phone, address, description,
}) => {
  const sql = `INSERT INTO order_request(customer_name, customer_email, customer_phone, customer_address, description, date_placed)
                VALUES ($1, $2, $3, $4, $5, $6) RETURNING no_request as id;`;

  try {
    const { result, rowCount } = await query(
      sql,
      name,
      email,
      phone,
      address,
      description,
      new Date(),
    );

    if (rowCount !== 1) throw new CustomError('No se pudo registrar la solicitud de orden', 500);

    return result[0];
  } catch (ex) {
    if (ex?.constraint === 'check_email') { throw new CustomError('El formato del email es inválido.', 400); }
    throw ex;
  }
};

const getOrderRequests = async (searchQuery) => {
  let queryResult;
  if (searchQuery) {
    const sql = `select * from order_request WHERE customer_name ILIKE $1 OR customer_email ILIKE $1 OR
                customer_phone ILIKE $1 OR customer_address ILIKE $1 OR description ILIKE $1 ORDER BY date_placed DESC`;
    queryResult = await query(sql, `%${searchQuery}%`);
  } else {
    queryResult = await query('select * from order_request ORDER BY date_placed DESC');
  }

  const { result, rowCount } = queryResult;

  if (rowCount === 0) throw new CustomError('No se encontraron resultados.', 404);

  return result.map((val) => ({
    id: val.no_request,
    customerName: val.customer_name,
    customerEmail: val.customer_email,
    customerPhone: val.customer_phone,
    customerAddress: val.customer_address,
    description: val.description,
    datePlaced: val.date_placed,
  }));
};

export { newOrderRequest, getOrderRequests };
