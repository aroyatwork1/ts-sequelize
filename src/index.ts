import './LoadEnv'; // Must be the first import
import app from '@server';
import logger from '@shared/Logger';
import { DBConnection } from './database/DBConnection'

async function main() {
    // Connect to DB
    const dbCOnn = new DBConnection();
    (global as any).dbConn = await dbCOnn.connect();

    // Start the server
    const port = Number(process.env.PORT || 3000);
    app.listen(port, () => {
        logger.info('Express server started on port: ' + port);
    });
}

main();
