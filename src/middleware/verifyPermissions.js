export default function (_params = [], _validateAllPermissions = false) {
  _params = Array.isArray(_params) ? _params : [_params];
  return (_req, _res, _next) => {
    const isValid = _validateAllPermissions
      ? _params.reduce((_valid, _param) => _valid && _req.permissions.includes(_param), true)
      : _req.permissions.find((_val) => _params.includes(_val));
    if (isValid) _next(null);
    else return _res.status(422).json({ message: 'You are not permitted for this operation' });
  };
}
