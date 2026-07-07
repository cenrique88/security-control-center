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
            workOrders: number;
            sites: number;
            quotes: number;
            payments: number;
            meetings: number;
        };
    } & {
        id: string;
        email: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        taxId: string | null;
        legalName: string | null;
        reference: string;
        address: string | null;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        traccarGeofenceId: number | null;
        logoUrl: string | null;
        type: import(".prisma/client").$Enums.CustomerType;
        status: import(".prisma/client").$Enums.CustomerStatus;
        notes: string | null;
    })[]>;
    create(dto: CreateCustomerDto): Promise<{
        _count: {
            workOrders: number;
            sites: number;
            quotes: number;
            payments: number;
            meetings: number;
        };
    } & {
        id: string;
        email: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        taxId: string | null;
        legalName: string | null;
        reference: string;
        address: string | null;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        traccarGeofenceId: number | null;
        logoUrl: string | null;
        type: import(".prisma/client").$Enums.CustomerType;
        status: import(".prisma/client").$Enums.CustomerStatus;
        notes: string | null;
    }>;
    update(id: string, dto: UpdateCustomerDto): Promise<{
        _count: {
            workOrders: number;
            sites: number;
            quotes: number;
            payments: number;
            meetings: number;
        };
    } & {
        id: string;
        email: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        taxId: string | null;
        legalName: string | null;
        reference: string;
        address: string | null;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        traccarGeofenceId: number | null;
        logoUrl: string | null;
        type: import(".prisma/client").$Enums.CustomerType;
        status: import(".prisma/client").$Enums.CustomerStatus;
        notes: string | null;
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
        address: string;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        traccarGeofenceId: number | null;
        notes: string | null;
        customerId: string;
    })[]>;
    profile(id: string): Promise<{
        customer: {
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
                        name: string;
                        sku: string | null;
                        unit: string;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    type: import(".prisma/client").$Enums.InventoryMovementType;
                    customerId: string | null;
                    workOrderId: string | null;
                    sourceType: string | null;
                    quantity: number;
                    stockAfter: number;
                    reason: string | null;
                    itemId: string;
                    installedDeviceId: string | null;
                })[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                type: import(".prisma/client").$Enums.ServiceType;
                status: import(".prisma/client").$Enums.WorkOrderStatus;
                notes: string | null;
                title: string;
                scheduledAt: Date | null;
                completedAt: Date | null;
                reportBeforeNotes: string | null;
                reportAfterNotes: string | null;
                reportTasks: string | null;
                reportTests: string | null;
                reportRecommendations: string | null;
                reportPhotos: Prisma.JsonValue | null;
                siteId: string | null;
                customerId: string;
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
                address: string;
                latitude: Prisma.Decimal | null;
                longitude: Prisma.Decimal | null;
                traccarGeofenceId: number | null;
                notes: string | null;
                customerId: string;
            })[];
            quotes: {
                number: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.QuoteStatus;
                title: string;
                customerId: string;
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
                reference: string | null;
                notes: string | null;
                customerId: string;
                currency: string;
                transactionType: string;
                category: string;
                concept: string;
                amount: Prisma.Decimal;
                method: string | null;
                dueDate: Date | null;
                paidAt: Date | null;
                quoteId: string | null;
                workOrderId: string | null;
                vehicleId: string | null;
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
                type: import(".prisma/client").$Enums.MeetingType;
                status: import(".prisma/client").$Enums.MeetingStatus;
                notes: string | null;
                customerId: string;
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
            _count: {
                workOrders: number;
                sites: number;
                quotes: number;
                payments: number;
                meetings: number;
            };
        } & {
            id: string;
            email: string | null;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            taxId: string | null;
            legalName: string | null;
            reference: string;
            address: string | null;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            traccarGeofenceId: number | null;
            logoUrl: string | null;
            type: import(".prisma/client").$Enums.CustomerType;
            status: import(".prisma/client").$Enums.CustomerStatus;
            notes: string | null;
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
            address: string;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            traccarGeofenceId: number | null;
            notes: string | null;
            customerId: string;
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
                    name: string;
                    sku: string | null;
                    unit: string;
                };
            } & {
                id: string;
                createdAt: Date;
                type: import(".prisma/client").$Enums.InventoryMovementType;
                customerId: string | null;
                workOrderId: string | null;
                sourceType: string | null;
                quantity: number;
                stockAfter: number;
                reason: string | null;
                itemId: string;
                installedDeviceId: string | null;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.ServiceType;
            status: import(".prisma/client").$Enums.WorkOrderStatus;
            notes: string | null;
            title: string;
            scheduledAt: Date | null;
            completedAt: Date | null;
            reportBeforeNotes: string | null;
            reportAfterNotes: string | null;
            reportTasks: string | null;
            reportTests: string | null;
            reportRecommendations: string | null;
            reportPhotos: Prisma.JsonValue | null;
            siteId: string | null;
            customerId: string;
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
            siteId: string;
            brand: string | null;
            model: string | null;
            serial: string | null;
            ipAddress: string | null;
            installedAt: Date | null;
        })[];
        quotes: {
            number: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.QuoteStatus;
            title: string;
            customerId: string;
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
            reference: string | null;
            notes: string | null;
            customerId: string;
            currency: string;
            transactionType: string;
            category: string;
            concept: string;
            amount: Prisma.Decimal;
            method: string | null;
            dueDate: Date | null;
            paidAt: Date | null;
            quoteId: string | null;
            workOrderId: string | null;
            vehicleId: string | null;
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
            type: import(".prisma/client").$Enums.MeetingType;
            status: import(".prisma/client").$Enums.MeetingStatus;
            notes: string | null;
            customerId: string;
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
        address: string;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        traccarGeofenceId: number | null;
        notes: string | null;
        customerId: string;
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
