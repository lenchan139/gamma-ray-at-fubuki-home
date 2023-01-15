import App from '@/app';
import AuthRoute from '@routes/auth.route';
import IndexRoute from '@routes/index.route';
import UsersRoute from '@routes/users.route';
import validateEnv from '@utils/validateEnv';
import ApiV1Route from './routes/api_v1/index.route';
import RayRoute from './routes/api_v1/ray.route';

validateEnv();

const app = new App([new IndexRoute(), new ApiV1Route()]);

app.listen();
