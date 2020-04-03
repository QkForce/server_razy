const express = require('express');
const mongoose = require('mongoose'); // для подключение к БД
const bodyParser = require('body-parser'); // для парсинга json
const cors = require('cors'); // мы можем отвечать клиенту даже если клиент в другом домене
const morgan = require('morgan'); // для логирование
const path = require('path');
const keys = require('./config/keys');

// Переменные для роутеров
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const distributorOwnerRoutes = require('./routes/distributor_owner.routes');
const distributorRoutes = require('./routes/distributor.routes');
const courierRoutes = require('./routes/courier.routes');
const clientRoutes = require('./routes/client.routes');
const orderRoutes = require('./routes/order.routes');
const productRoutes = require('./routes/product.routes');
const routeRoutes = require('./routes/route.routes');
const gisRoutes = require('./routes/arcgis.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const fakerRoutes = require('./routes/faker.routes');
const app = express();

// Настройка плдключение к БД
mongoose.connect(keys.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => console.log('We connected to MongoDB'))
    .catch((error) => console.log(error));


// Настройки сервера
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));


// Роутеры
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/distributor_owner', distributorOwnerRoutes);
app.use('/api/distributor', distributorRoutes);
app.use('/api/courier', courierRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/product', productRoutes);
app.use('/api/route', routeRoutes);
app.use('/api/gis', gisRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/faker', fakerRoutes);


if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/public'));

    app.get('*', (request, response) => {
        response.sendFile(
            path.resolve(__dirname, 'client', 'public', 'index.html')
        )
    });
}

module["exports"] = app;