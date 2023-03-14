import indexRouter from '../app/home/home.route';
import authRouter from '../app/auth/auth.route';
import userRouter from '../app/user/user.route';
import roleRouter from '../app/role/role.route';
import propertyRouter from '../app/property/property.route';

export default function (app) {
  app.use('/', indexRouter);
  app.use('/auth', authRouter);
  app.use('/user', userRouter);
  app.use('/role', roleRouter);
  app.use('/property', propertyRouter);
}
