import mysql from 'mysql';

export const initDb = async (): Promise<void> => {
  const connection = mysql.createConnection({
    host: process.env.TYPEORM_HOST,
    user: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
  });

  connection.connect();
  const queryString = `CREATE DATABASE IF NOT EXISTS ${process.env.TYPEORM_DATABASE}`;
  connection.query(queryString, function (error) {
    if (error) throw error;
  });

  connection.end();
};
