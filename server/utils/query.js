export function pagination(req) {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function searchFilter(fields, search) {
  if (!search) return {};
  return {
    $or: fields.map((field) => ({ [field]: { $regex: search, $options: 'i' } }))
  };
}
