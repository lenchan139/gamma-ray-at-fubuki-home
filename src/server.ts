import App from '@/app';
import IndexRoute from '@routes/index.route';
import validateEnv from '@utils/validateEnv';
import ApiV1Route from './routes/api_v1/index.route';

validateEnv();

const app = new App([new IndexRoute(), new ApiV1Route()]);

app.listen();
