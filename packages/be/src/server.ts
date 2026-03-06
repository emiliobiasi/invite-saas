import { env } from '@config/env';
import { app } from './app';

const port = env.PORT;

app.listen(port);

console.log(`🚀 Server running on http://localhost:${port}`);
