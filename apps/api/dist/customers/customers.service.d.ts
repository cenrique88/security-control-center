import { CustomerType, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
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
    constructor(prisma: PrismaService);
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
        reference: string;
        name: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.CustomerType;
        status: import(".prisma/client").$Enums.CustomerStatus;
        legalName: string | null;
        taxId: string | null;
        email: string | null;
        phone: string | null;
        address: string | null;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        traccarGeofenceId: number | null;
        logoUrl: string | null;
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
        reference: string;
        name: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.CustomerType;
        status: import(".prisma/client").$Enums.CustomerStatus;
        legalName: string | null;
        taxId: string | null;
        email: string | null;
        phone: string | null;
        address: string | null;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        traccarGeofenceId: number | null;
        logoUrl: string | null;
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
        reference: string;
        name: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.CustomerType;
        status: import(".prisma/client").$Enums.CustomerStatus;
        legalName: string | null;
        taxId: string | null;
        email: string | null;
        phone: string | null;
        address: string | null;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        traccarGeofenceId: number | null;
        logoUrl: string | null;
    }>;
    listSites(customerId: string): Promise<({
        _count: {
            workOrders: number;
            equipment: number;
        };
    } & {
        id: string;
        name: string;
        customerId: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        traccarGeofenceId: number | null;
    })[]>;
    profile(id: string): Promise<{
        customer: {
            payments: {
                id: string;
                reference: string | null;
                category: string;
                customerId: string;
                currency: string;
                notes: string | null;
                createdAt: Date;
                updatedAt: Date;
                quoteId: string | null;
                workOrderId: string | null;
                vehicleId: string | null;
                inventoryItemId: string | null;
                transactionType: string;
                concept: string;
                amount: Prisma.Decimal;
                quantity: number | null;
                unitPrice: Prisma.Decimal | null;
                method: string | null;
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
                site: {
                    id: string;
                    name: string;
                    address: string;
                } | null;
                inventoryMovements: ({
                    installedDevice: {
                        id: string;
                        brand: string | null;
                        model: string | null;
                        serial: string | null;
                        ipAddress: string | null;
                    } | null;
                    item: {
                        id: string;
                        sku: string | null;
                        name: string;
                        unit: string;
                    };
                } & {
                    id: string;
                    sourceType: string | null;
                    customerId: string | null;
                    currency: string | null;
                    createdAt: Date;
                    type: import(".prisma/client").$Enums.InventoryMovementType;
                    workOrderId: string | null;
                    quantity: number;
                    itemId: string;
                    paymentId: string | null;
                    stockAfter: number;
                    unitCost: Prisma.Decimal | null;
                    totalCost: Prisma.Decimal | null;
                    reason: string | null;
                    installedDeviceId: string | null;
                })[];
            } & {
                id: string;
                customerId: string;
                notes: string | null;
                createdAt: Date;
                updatedAt: Date;
                siteId: string | null;
                title: string;
                type: import(".prisma/client").$Enums.ServiceType;
                status: import(".prisma/client").$Enums.WorkOrderStatus;
                scheduledAt: Date | null;
                completedAt: Date | null;
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
                customerId: string;
                notes: string | null;
                createdAt: Date;
                updatedAt: Date;
                address: string;
                latitude: Prisma.Decimal | null;
                longitude: Prisma.Decimal | null;
                traccarGeofenceId: number | null;
            })[];
            quotes: {
                number: string;
                id: string;
                customerId: string;
                currency: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                status: import(".prisma/client").$Enums.QuoteStatus;
                acceptedAt: Date | null;
                total: Prisma.Decimal;
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
                costTotal: Prisma.Decimal;
                estimatedProfit: Prisma.Decimal;
                estimatedMargin: Prisma.Decimal;
                meetingId: string | null;
                service: import(".prisma/client").$Enums.ServiceType;
                pricingMode: import(".prisma/client").$Enums.QuotePricingMode;
                issueDate: Date;
                validUntil: Date | null;
                taxIncluded: boolean;
                internalNotes: string | null;
                commercialTerms: string | null;
                executionTime: string | null;
                warranty: string | null;
                paymentTerms: string | null;
                sentAt: Date | null;
                rejectedAt: Date | null;
                createdBy: string | null;
            }[];
            documents: {
                id: string;
                name: string;
                customerId: string;
                createdAt: Date;
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
                customerId: string;
                notes: string | null;
                createdAt: Date;
                updatedAt: Date;
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
            reference: string;
            name: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.CustomerType;
            status: import(".prisma/client").$Enums.CustomerStatus;
            legalName: string | null;
            taxId: string | null;
            email: string | null;
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
            name: string;
            customerId: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
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
                    brand: string | null;
                    model: string | null;
                    serial: string | null;
                    ipAddress: string | null;
                } | null;
                item: {
                    id: string;
                    sku: string | null;
                    name: string;
                    unit: string;
                };
            } & {
                id: string;
                sourceType: string | null;
                customerId: string | null;
                currency: string | null;
                createdAt: Date;
                type: import(".prisma/client").$Enums.InventoryMovementType;
                workOrderId: string | null;
                quantity: number;
                itemId: string;
                paymentId: string | null;
                stockAfter: number;
                unitCost: Prisma.Decimal | null;
                totalCost: Prisma.Decimal | null;
                reason: string | null;
                installedDeviceId: string | null;
            })[];
        } & {
            id: string;
            customerId: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            siteId: string | null;
            title: string;
            type: import(".prisma/client").$Enums.ServiceType;
            status: import(".prisma/client").$Enums.WorkOrderStatus;
            scheduledAt: Date | null;
            completedAt: Date | null;
            reportBeforeNotes: string | null;
            reportAfterNotes: string | null;
            reportTasks: string | null;
            reportTests: string | null;
            reportRecommendations: string | null;
            reportPhotos: Prisma.JsonValue | null;
        })[];
        equipment: ({
            site: {
                id: string;
                name: string;
                customer: {
                    id: string;
                    name: string;
                };
                address: string;
            };
            inventoryMovements: {
                id: string;
                createdAt: Date;
                workOrder: {
                    id: string;
                    title: string;
                    status: import(".prisma/client").$Enums.WorkOrderStatus;
                    scheduledAt: Date | null;
                    completedAt: Date | null;
                } | null;
                workOrderId: string | null;
            }[];
        } & {
            id: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            siteId: string;
            type: import(".prisma/client").$Enums.ServiceType;
            brand: string | null;
            model: string | null;
            serial: string | null;
            ipAddress: string | null;
            installedAt: Date | null;
        })[];
        quotes: {
            number: string;
            id: string;
            customerId: string;
            currency: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            status: import(".prisma/client").$Enums.QuoteStatus;
            acceptedAt: Date | null;
            total: Prisma.Decimal;
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
            costTotal: Prisma.Decimal;
            estimatedProfit: Prisma.Decimal;
            estimatedMargin: Prisma.Decimal;
            meetingId: string | null;
            service: import(".prisma/client").$Enums.ServiceType;
            pricingMode: import(".prisma/client").$Enums.QuotePricingMode;
            issueDate: Date;
            validUntil: Date | null;
            taxIncluded: boolean;
            internalNotes: string | null;
            commercialTerms: string | null;
            executionTime: string | null;
            warranty: string | null;
            paymentTerms: string | null;
            sentAt: Date | null;
            rejectedAt: Date | null;
            createdBy: string | null;
        }[];
        payments: {
            id: string;
            reference: string | null;
            category: string;
            customerId: string;
            currency: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            quoteId: string | null;
            workOrderId: string | null;
            vehicleId: string | null;
            inventoryItemId: string | null;
            transactionType: string;
            concept: string;
            amount: Prisma.Decimal;
            quantity: number | null;
            unitPrice: Prisma.Decimal | null;
            method: string | null;
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
            customerId: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
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
            customerId: string;
            createdAt: Date;
            mimeType: string | null;
            size: number | null;
            dataUrl: string;
        }[];
    }>;
    createDocument(customerId: string, dto: CreateCustomerDocumentDto): Promise<{
        id: string;
        name: string;
        customerId: string;
        createdAt: Date;
        mimeType: string | null;
        size: number | null;
        dataUrl: string;
    }>;
    deleteDocument(customerId: string, documentId: string): Promise<{
        id: string;
        name: string;
        customerId: string;
        createdAt: Date;
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
        customerId: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        traccarGeofenceId: number | null;
    }>;
    private ensureExists;
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
