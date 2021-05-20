//app.ts
import express, {Router} from 'express';
import helmet from 'helmet';
import cors from 'cors';

export default (router: Router) => {
    const app = express();
    app.use(helmet());
    app.use(cors());
    app.use(express.json());
    app.use(router);
    return app;
}

