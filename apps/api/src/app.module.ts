import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { CustomersModule } from "./customers/customers.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { DevicesModule } from "./devices/devices.module";
import { GmailModule } from "./gmail/gmail.module";
import { InventoryModule } from "./inventory/inventory.module";
import { MeetingsModule } from "./meetings/meetings.module";
import { PaymentsModule } from "./payments/payments.module";
import { PriceBookModule } from "./price-book/price-book.module";
import { PrismaModule } from "./prisma/prisma.module";
import { QuotesModule } from "./quotes/quotes.module";
import { VehiclesModule } from "./vehicles/vehicles.module";
import { WhatsAppModule } from "./whatsapp/whatsapp.module";
import { WorkOrdersModule } from "./work-orders/work-orders.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    DashboardModule,
    CustomersModule,
    DevicesModule,
    WorkOrdersModule,
    QuotesModule,
    PaymentsModule,
    VehiclesModule,
    InventoryModule,
    PriceBookModule,
    MeetingsModule,
    GmailModule,
    WhatsAppModule,
  ],
})
export class AppModule {}
