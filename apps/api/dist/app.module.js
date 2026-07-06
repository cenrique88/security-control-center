"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const auth_module_1 = require("./auth/auth.module");
const customers_module_1 = require("./customers/customers.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const devices_module_1 = require("./devices/devices.module");
const dispatch_module_1 = require("./dispatch/dispatch.module");
const fuel_module_1 = require("./fuel/fuel.module");
const gmail_module_1 = require("./gmail/gmail.module");
const inventory_module_1 = require("./inventory/inventory.module");
const meetings_module_1 = require("./meetings/meetings.module");
const payments_module_1 = require("./payments/payments.module");
const price_book_module_1 = require("./price-book/price-book.module");
const prisma_module_1 = require("./prisma/prisma.module");
const quotes_module_1 = require("./quotes/quotes.module");
const vehicles_module_1 = require("./vehicles/vehicles.module");
const whatsapp_module_1 = require("./whatsapp/whatsapp.module");
const work_orders_module_1 = require("./work-orders/work-orders.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            dashboard_module_1.DashboardModule,
            customers_module_1.CustomersModule,
            devices_module_1.DevicesModule,
            dispatch_module_1.DispatchModule,
            fuel_module_1.FuelModule,
            work_orders_module_1.WorkOrdersModule,
            quotes_module_1.QuotesModule,
            payments_module_1.PaymentsModule,
            vehicles_module_1.VehiclesModule,
            inventory_module_1.InventoryModule,
            price_book_module_1.PriceBookModule,
            meetings_module_1.MeetingsModule,
            gmail_module_1.GmailModule,
            whatsapp_module_1.WhatsAppModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map