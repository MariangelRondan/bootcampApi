const advancedResults = (model, populate) => async(req, res, next) => {
    let query;

    const reqQuery = { ...req.query };

    // Campos a excluir
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Eliminar campos excluidos de reqQuery
    removeFields.forEach(param => delete reqQuery[param])

    let queryStr = JSON.stringify(reqQuery)

    // Crear operadores ($gt, $gte, $lt, $lte, $in) para seguir la sintaxis de Mongoose
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    //Finding resources
    query = model.find(JSON.parse(queryStr))

    // SELECCIONAR CAMPOS
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // ORDENAR
    // /v1/bootcamps?select=name&sort=name para orndenar alf
    // /v1/bootcamps?select=name&sort=-name para ordenar de z a a
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    //pagination  -> route /bootcamps?page=2&limit=2
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex= page  * limit;
    const total = await model.countDocuments();

    query = query.skip(startIndex).limit(limit);

    if(populate){
        query = query.populate(populate)
    }

    //Excecuting the query
    const results = await query;

    //Pagination result
    const pagination = {};

    if(endIndex < total){
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    if(startIndex > 0){
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    res.advancedResults = {
        succes: true,
        count: results.length,
        pagination: pagination,
        data:results
    }

next()
}

module.exports = advancedResults;
