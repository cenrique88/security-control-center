import { CustomerType, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { VehiclesService } from "../vehicles/vehicles.service";
import { CreateCustomerDocumentDto } from "./dto/create-customer-document.dto";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { CreateSiteDto } from "./dto/create-site.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
type CustomerFilters = {
    search?: string;
    status?: "ACTIVE" | "PROSPECT" | "INACTIVE";
    type?: CustomerType;
};
export declare class CustomersService {
    private readonly prisma;
    private readonly vehiclesService;
    constructor(prisma: PrismaService, vehiclesService: VehiclesService);
    list(filters: CustomerFilters): Promise<({
        _count: {
            payments: number;
            workOrders: number;
            sites: number;
            quotes: number;
            meetings: number;
        };
    } & {
        id: string;
        name: string;
        logoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        reference: string;
        notes: string | null;
        legalName: string | null;
        taxId: string | null;
        email: string | null;
        phone: string | null;
        address: string | null;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        traccarGeofenceId: number | null;
        type: import(".prisma/client").$Enums.CustomerType;
        status: import(".prisma/client").$Enums.CustomerStatus;
    })[]>;
    create(dto: CreateCustomerDto): Promise<{
        _count: {
            payments: number;
            workOrders: number;
            sites: number;
            quotes: number;
            meetings: number;
        };
    } & {
        id: string;
        name: string;
        logoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        reference: string;
        notes: string | null;
        legalName: string | null;
        taxId: string | null;
        email: string | null;
        phone: string | null;
        address: string | null;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        traccarGeofenceId: number | null;
        type: import(".prisma/client").$Enums.CustomerType;
        status: import(".prisma/client").$Enums.CustomerStatus;
    }>;
    update(id: string, dto: UpdateCustomerDto): Promise<{
        _count: {
            payments: number;
            workOrders: number;
            sites: number;
            quotes: number;
            meetings: number;
        };
    } & {
        id: string;
        name: string;
        logoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        reference: string;
        notes: string | null;
        legalName: string | null;
        taxId: string | null;
        email: string | null;
        phone: string | null;
        address: string | null;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        traccarGeofenceId: number | null;
        type: import(".prisma/client").$Enums.CustomerType;
        status: import(".prisma/client").$Enums.CustomerStatus;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        type: import(".prisma/client").$Enums.CustomerType;
    }>;
    listSites(customerId: string): Promise<({
        _count: {
            workOrders: number;
            equipment: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        notes: string | null;
        address: string;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        traccarGeofenceId: number | null;
    })[]>;
    profile(id: string): Promise<{
        customer: {
            payments: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                customerId: string;
                quoteId: string | null;
                workOrderId: string | null;
                vehicleId: string | null;
                inventoryItemId: string | null;
                transactionType: string;
                category: string;
                concept: string;
                amount: Prisma.Decimal;
                quantity: number | null;
                unitPrice: Prisma.Decimal | null;
                currency: string;
                method: string | null;
                reference: string | null;
                notes: string | null;
                dueDate: Date | null;
                paidAt: Date | null;
            }[];
            _count: {
                payments: number;
                workOrders: number;
                sites: number;
                quotes: number;
                meetings: number;
            };
            workOrders: ({
                inventoryMovements: ({
                    item: {
                        id: string;
                        name: string;
                        sku: string | null;
                        unit: string;
                    };
                    installedDevice: {
                        id: string;
                        model: string | null;
                        brand: string | null;
                        serial: string | null;
                        ipAddress: string | null;
                    } | null;
                } & {
                    id: string;
                    createdAt: Date;
                    customerId: string | null;
                    quoteId: string | null;
                    workOrderId: string | null;
                    quantity: number;
                    currency: string | null;
                    type: import(".prisma/client").$Enums.InventoryMovementType;
                    sourceType: string | null;
                    itemId: string;
                    paymentId: string | null;
                    stockAfter: number;
                    unitCost: Prisma.Decimal | null;
                    totalCost: Prisma.Decimal | null;
                    reason: string | null;
                    installedDeviceId: string | null;
                })[];
                site: {
                    id: string;
                    name: string;
                    address: string;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                customerId: string;
                quoteId: string | null;
                notes: string | null;
                type: import(".prisma/client").$Enums.ServiceType;
                status: import(".prisma/client").$Enums.WorkOrderStatus;
                title: string;
                siteId: string | null;
                scheduledAt: Date | null;
                completedAt: Date | null;
                reportType: string | null;
                reportBeforeNotes: string | null;
                reportAfterNotes: string | null;
                reportTasks: string | null;
                reportTests: string | null;
                reportRecommendations: string | null;
                reportPhotos: Prisma.JsonValue | null;
            })[];
            sites: ({
                _count: {
                    workOrders: number;
                    equipment: number;
                };
            } & {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                customerId: string;
                notes: string | null;
                address: string;
                latitude: Prisma.Decimal | null;
                longitude: Prisma.Decimal | null;
                traccarGeofenceId: number | null;
            })[];
            quotes: {
                number: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                customerId: string;
                currency: string;
                status: import(".prisma/client").$Enums.QuoteStatus;
                meetingId: string | null;
                title: string;
                service: import(".prisma/client").$Enums.ServiceType;
                pricingMode: import(".prisma/client").$Enums.QuotePricingMode;
                issueDate: Date;
                validUntil: Date | null;
                taxIncluded: boolean;
                discountPercent: Prisma.Decimal;
                profitMarginPercent: Prisma.Decimal;
                laborPoints: Prisma.Decimal;
                materialsSubtotal: Prisma.Decimal;
                laborSubtotal: Prisma.Decimal;
                expensesSubtotal: Prisma.Decimal;
                subtotal: Prisma.Decimal;
                discountAmount: Prisma.Decimal;
                taxableBase: Prisma.Decimal;
                tax: Prisma.Decimal;
                total: Prisma.Decimal;
                costTotal: Prisma.Decimal;
                estimatedProfit: Prisma.Decimal;
                estimatedMargin: Prisma.Decimal;
                internalNotes: string | null;
                commercialTerms: string | null;
                executionTime: string | null;
                warranty: string | null;
                paymentTerms: string | null;
                sentAt: Date | null;
                acceptedAt: Date | null;
                rejectedAt: Date | null;
                createdBy: string | null;
            }[];
            documents: {
                id: string;
                name: string;
                createdAt: Date;
                customerId: string;
                mimeType: string | null;
                size: number | null;
                dataUrl: string;
            }[];
            meetings: ({
                attachments: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    meetingId: string;
                    mimeType: string | null;
                    size: number | null;
                    dataUrl: string;
                }[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                customerId: string;
                notes: string | null;
                type: import(".prisma/client").$Enums.MeetingType;
                status: import(".prisma/client").$Enums.MeetingStatus;
                dateTime: Date;
                contact: string | null;
                objective: string;
                commitments: string | null;
                nextStep: string | null;
                followUpDate: Date | null;
                attendees: string | null;
                needs: string | null;
                equipmentNeeded: string | null;
                estimatedBudget: Prisma.Decimal | null;
                closeProbability: number | null;
                reminderEnabled: boolean;
                reminderMinutesBefore: number;
                reminderSentAt: Date | null;
            })[];
        } & {
            id: string;
            name: string;
            logoUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
            reference: string;
            notes: string | null;
            legalName: string | null;
            taxId: string | null;
            email: string | null;
            phone: string | null;
            address: string | null;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            traccarGeofenceId: number | null;
            type: import(".prisma/client").$Enums.CustomerType;
            status: import(".prisma/client").$Enums.CustomerStatus;
        };
        sites: ({
            _count: {
                workOrders: number;
                equipment: number;
            };
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            notes: string | null;
            address: string;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            traccarGeofenceId: number | null;
        })[];
        workOrders: ({
            inventoryMovements: ({
                item: {
                    id: string;
                    name: string;
                    sku: string | null;
                    unit: string;
                };
                installedDevice: {
                    id: string;
                    model: string | null;
                    brand: string | null;
                    serial: string | null;
                    ipAddress: string | null;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                customerId: string | null;
                quoteId: string | null;
                workOrderId: string | null;
                quantity: number;
                currency: string | null;
                type: import(".prisma/client").$Enums.InventoryMovementType;
                sourceType: string | null;
                itemId: string;
                paymentId: string | null;
                stockAfter: number;
                unitCost: Prisma.Decimal | null;
                totalCost: Prisma.Decimal | null;
                reason: string | null;
                installedDeviceId: string | null;
            })[];
            site: {
                id: string;
                name: string;
                address: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            quoteId: string | null;
            notes: string | null;
            type: import(".prisma/client").$Enums.ServiceType;
            status: import(".prisma/client").$Enums.WorkOrderStatus;
            title: string;
            siteId: string | null;
            scheduledAt: Date | null;
            completedAt: Date | null;
            reportType: string | null;
            reportBeforeNotes: string | null;
            reportAfterNotes: string | null;
            reportTasks: string | null;
            reportTests: string | null;
            reportRecommendations: string | null;
            reportPhotos: Prisma.JsonValue | null;
        })[];
        equipment: ({
            inventoryMovements: {
                id: string;
                createdAt: Date;
                workOrderId: string | null;
                workOrder: {
                    id: string;
                    status: import(".prisma/client").$Enums.WorkOrderStatus;
                    title: string;
                    scheduledAt: Date | null;
                    completedAt: Date | null;
                } | null;
            }[];
            site: {
                id: string;
                name: string;
                customer: {
                    id: string;
                    name: string;
                };
                address: string;
            };
        } & {
            id: string;
            model: string | null;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            type: import(".prisma/client").$Enums.ServiceType;
            siteId: string;
            brand: string | null;
            serial: string | null;
            ipAddress: string | null;
            installedAt: Date | null;
        })[];
        quotes: {
            number: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            currency: string;
            status: import(".prisma/client").$Enums.QuoteStatus;
            meetingId: string | null;
            title: string;
            service: import(".prisma/client").$Enums.ServiceType;
            pricingMode: import(".prisma/client").$Enums.QuotePricingMode;
            issueDate: Date;
            validUntil: Date | null;
            taxIncluded: boolean;
            discountPercent: Prisma.Decimal;
            profitMarginPercent: Prisma.Decimal;
            laborPoints: Prisma.Decimal;
            materialsSubtotal: Prisma.Decimal;
            laborSubtotal: Prisma.Decimal;
            expensesSubtotal: Prisma.Decimal;
            subtotal: Prisma.Decimal;
            discountAmount: Prisma.Decimal;
            taxableBase: Prisma.Decimal;
            tax: Prisma.Decimal;
            total: Prisma.Decimal;
            costTotal: Prisma.Decimal;
            estimatedProfit: Prisma.Decimal;
            estimatedMargin: Prisma.Decimal;
            internalNotes: string | null;
            commercialTerms: string | null;
            executionTime: string | null;
            warranty: string | null;
            paymentTerms: string | null;
            sentAt: Date | null;
            acceptedAt: Date | null;
            rejectedAt: Date | null;
            createdBy: string | null;
        }[];
        payments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            quoteId: string | null;
            workOrderId: string | null;
            vehicleId: string | null;
            inventoryItemId: string | null;
            transactionType: string;
            category: string;
            concept: string;
            amount: Prisma.Decimal;
            quantity: number | null;
            unitPrice: Prisma.Decimal | null;
            currency: string;
            method: string | null;
            reference: string | null;
            notes: string | null;
            dueDate: Date | null;
            paidAt: Date | null;
        }[];
        meetings: ({
            attachments: {
                id: string;
                name: string;
                createdAt: Date;
                meetingId: string;
                mimeType: string | null;
                size: number | null;
                dataUrl: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            notes: string | null;
            type: import(".prisma/client").$Enums.MeetingType;
            status: import(".prisma/client").$Enums.MeetingStatus;
            dateTime: Date;
            contact: string | null;
            objective: string;
            commitments: string | null;
            nextStep: string | null;
            followUpDate: Date | null;
            attendees: string | null;
            needs: string | null;
            equipmentNeeded: string | null;
            estimatedBudget: Prisma.Decimal | null;
            closeProbability: number | null;
            reminderEnabled: boolean;
            reminderMinutesBefore: number;
            reminderSentAt: Date | null;
        })[];
        documents: {
            id: string;
            name: string;
            createdAt: Date;
            customerId: string;
            mimeType: string | null;
            size: number | null;
            dataUrl: string;
        }[];
    }>;
    createDocument(customerId: string, dto: CreateCustomerDocumentDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        customerId: string;
        mimeType: string | null;
        size: number | null;
        dataUrl: string;
    }>;
    deleteDocument(customerId: string, documentId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        customerId: string;
        mimeType: string | null;
        size: number | null;
        dataUrl: string;
    }>;
    createSite(customerId: string, dto: CreateSiteDto): Promise<{
        _count: {
            workOrders: number;
            equipment: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        notes: string | null;
        address: string;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        traccarGeofenceId: number | null;
    }>;
    private ensureExists;
    private customerListInclude;
    private siteListInclude;
    private findListCustomer;
    private findListSite;
    private trySyncCustomerGeofence;
    private trySyncSiteGeofence;
    private toCreateData;
    private nextCustomerReference;
    private toUpdateData;
    private cleanOptional;
    private normalizeCoordinates;
    private normalizePackedUruguayCoordinate;
    private isValidLatitude;
    private isValidLongitude;
    private isUruguayCoordinate;
    private cleanNullable;
}
export {};
