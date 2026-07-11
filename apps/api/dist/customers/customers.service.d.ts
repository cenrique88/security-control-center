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
            quotes: number;
            workOrders: number;
            sites: number;
            payments: number;
            meetings: number;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        email: string | null;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.CustomerType;
        status: import(".prisma/client").$Enums.CustomerStatus;
        notes: string | null;
        reference: string;
        legalName: string | null;
        taxId: string | null;
        phone: string | null;
        address: string | null;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        traccarGeofenceId: number | null;
        logoUrl: string | null;
    })[]>;
    create(dto: CreateCustomerDto): Promise<{
        _count: {
            quotes: number;
            workOrders: number;
            sites: number;
            payments: number;
            meetings: number;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        email: string | null;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.CustomerType;
        status: import(".prisma/client").$Enums.CustomerStatus;
        notes: string | null;
        reference: string;
        legalName: string | null;
        taxId: string | null;
        phone: string | null;
        address: string | null;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        traccarGeofenceId: number | null;
        logoUrl: string | null;
    }>;
    update(id: string, dto: UpdateCustomerDto): Promise<{
        _count: {
            quotes: number;
            workOrders: number;
            sites: number;
            payments: number;
            meetings: number;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        email: string | null;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.CustomerType;
        status: import(".prisma/client").$Enums.CustomerStatus;
        notes: string | null;
        reference: string;
        legalName: string | null;
        taxId: string | null;
        phone: string | null;
        address: string | null;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        traccarGeofenceId: number | null;
        logoUrl: string | null;
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
        createdAt: Date;
        name: string;
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
            _count: {
                quotes: number;
                workOrders: number;
                sites: number;
                payments: number;
                meetings: number;
            };
            quotes: {
                number: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                customerId: string;
                status: import(".prisma/client").$Enums.QuoteStatus;
                title: string;
                service: import(".prisma/client").$Enums.ServiceType;
                pricingMode: import(".prisma/client").$Enums.QuotePricingMode;
                currency: string;
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
                meetingId: string | null;
            }[];
            workOrders: ({
                site: {
                    id: string;
                    name: string;
                    address: string;
                } | null;
                inventoryMovements: ({
                    installedDevice: {
                        id: string;
                        model: string | null;
                        brand: string | null;
                        serial: string | null;
                        ipAddress: string | null;
                    } | null;
                    item: {
                        id: string;
                        name: string;
                        sku: string | null;
                        unit: string;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    customerId: string | null;
                    type: import(".prisma/client").$Enums.InventoryMovementType;
                    quoteId: string | null;
                    currency: string | null;
                    quantity: number;
                    workOrderId: string | null;
                    sourceType: string | null;
                    stockAfter: number;
                    unitCost: Prisma.Decimal | null;
                    totalCost: Prisma.Decimal | null;
                    reason: string | null;
                    itemId: string;
                    paymentId: string | null;
                    installedDeviceId: string | null;
                })[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                customerId: string;
                type: import(".prisma/client").$Enums.ServiceType;
                status: import(".prisma/client").$Enums.WorkOrderStatus;
                notes: string | null;
                title: string;
                scheduledAt: Date | null;
                completedAt: Date | null;
                reportType: string | null;
                reportBeforeNotes: string | null;
                reportAfterNotes: string | null;
                reportTasks: string | null;
                reportTests: string | null;
                reportRecommendations: string | null;
                reportPhotos: Prisma.JsonValue | null;
                quoteId: string | null;
                siteId: string | null;
            })[];
            sites: ({
                _count: {
                    workOrders: number;
                    equipment: number;
                };
            } & {
                id: string;
                createdAt: Date;
                name: string;
                updatedAt: Date;
                customerId: string;
                notes: string | null;
                address: string;
                latitude: Prisma.Decimal | null;
                longitude: Prisma.Decimal | null;
                traccarGeofenceId: number | null;
            })[];
            payments: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                customerId: string;
                notes: string | null;
                reference: string | null;
                method: string | null;
                vehicleId: string | null;
                quoteId: string | null;
                currency: string;
                transactionType: string;
                category: string;
                concept: string;
                amount: Prisma.Decimal;
                quantity: number | null;
                unitPrice: Prisma.Decimal | null;
                dueDate: Date | null;
                paidAt: Date | null;
                workOrderId: string | null;
                inventoryItemId: string | null;
            }[];
            documents: {
                id: string;
                createdAt: Date;
                name: string;
                customerId: string;
                mimeType: string | null;
                size: number | null;
                dataUrl: string;
            }[];
            meetings: ({
                attachments: {
                    id: string;
                    createdAt: Date;
                    name: string;
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
                dateTime: Date;
                contact: string | null;
                type: import(".prisma/client").$Enums.MeetingType;
                status: import(".prisma/client").$Enums.MeetingStatus;
                objective: string;
                notes: string | null;
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
            createdAt: Date;
            name: string;
            email: string | null;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.CustomerType;
            status: import(".prisma/client").$Enums.CustomerStatus;
            notes: string | null;
            reference: string;
            legalName: string | null;
            taxId: string | null;
            phone: string | null;
            address: string | null;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            traccarGeofenceId: number | null;
            logoUrl: string | null;
        };
        sites: ({
            _count: {
                workOrders: number;
                equipment: number;
            };
        } & {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            customerId: string;
            notes: string | null;
            address: string;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            traccarGeofenceId: number | null;
        })[];
        workOrders: ({
            site: {
                id: string;
                name: string;
                address: string;
            } | null;
            inventoryMovements: ({
                installedDevice: {
                    id: string;
                    model: string | null;
                    brand: string | null;
                    serial: string | null;
                    ipAddress: string | null;
                } | null;
                item: {
                    id: string;
                    name: string;
                    sku: string | null;
                    unit: string;
                };
            } & {
                id: string;
                createdAt: Date;
                customerId: string | null;
                type: import(".prisma/client").$Enums.InventoryMovementType;
                quoteId: string | null;
                currency: string | null;
                quantity: number;
                workOrderId: string | null;
                sourceType: string | null;
                stockAfter: number;
                unitCost: Prisma.Decimal | null;
                totalCost: Prisma.Decimal | null;
                reason: string | null;
                itemId: string;
                paymentId: string | null;
                installedDeviceId: string | null;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            type: import(".prisma/client").$Enums.ServiceType;
            status: import(".prisma/client").$Enums.WorkOrderStatus;
            notes: string | null;
            title: string;
            scheduledAt: Date | null;
            completedAt: Date | null;
            reportType: string | null;
            reportBeforeNotes: string | null;
            reportAfterNotes: string | null;
            reportTasks: string | null;
            reportTests: string | null;
            reportRecommendations: string | null;
            reportPhotos: Prisma.JsonValue | null;
            quoteId: string | null;
            siteId: string | null;
        })[];
        equipment: ({
            site: {
                customer: {
                    id: string;
                    name: string;
                };
                id: string;
                name: string;
                address: string;
            };
            inventoryMovements: {
                workOrder: {
                    id: string;
                    status: import(".prisma/client").$Enums.WorkOrderStatus;
                    title: string;
                    scheduledAt: Date | null;
                    completedAt: Date | null;
                } | null;
                id: string;
                createdAt: Date;
                workOrderId: string | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.ServiceType;
            notes: string | null;
            model: string | null;
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
            status: import(".prisma/client").$Enums.QuoteStatus;
            title: string;
            service: import(".prisma/client").$Enums.ServiceType;
            pricingMode: import(".prisma/client").$Enums.QuotePricingMode;
            currency: string;
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
            meetingId: string | null;
        }[];
        payments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            notes: string | null;
            reference: string | null;
            method: string | null;
            vehicleId: string | null;
            quoteId: string | null;
            currency: string;
            transactionType: string;
            category: string;
            concept: string;
            amount: Prisma.Decimal;
            quantity: number | null;
            unitPrice: Prisma.Decimal | null;
            dueDate: Date | null;
            paidAt: Date | null;
            workOrderId: string | null;
            inventoryItemId: string | null;
        }[];
        meetings: ({
            attachments: {
                id: string;
                createdAt: Date;
                name: string;
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
            dateTime: Date;
            contact: string | null;
            type: import(".prisma/client").$Enums.MeetingType;
            status: import(".prisma/client").$Enums.MeetingStatus;
            objective: string;
            notes: string | null;
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
            createdAt: Date;
            name: string;
            customerId: string;
            mimeType: string | null;
            size: number | null;
            dataUrl: string;
        }[];
    }>;
    createDocument(customerId: string, dto: CreateCustomerDocumentDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        customerId: string;
        mimeType: string | null;
        size: number | null;
        dataUrl: string;
    }>;
    deleteDocument(customerId: string, documentId: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
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
        createdAt: Date;
        name: string;
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
