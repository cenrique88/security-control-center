import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCustomerDocumentDto } from "./dto/create-customer-document.dto";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { CreateSiteDto } from "./dto/create-site.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
type CustomerFilters = {
    search?: string;
    status?: "ACTIVE" | "PROSPECT" | "INACTIVE";
    type?: "NORMAL" | "THIRD_PARTY";
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
        address: string | null;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        reference: string;
        email: string | null;
        phone: string | null;
        taxId: string | null;
        legalName: string | null;
        traccarGeofenceId: number | null;
        logoUrl: string | null;
        type: import(".prisma/client").$Enums.CustomerType;
        status: import(".prisma/client").$Enums.CustomerStatus;
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
        address: string | null;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        reference: string;
        email: string | null;
        phone: string | null;
        taxId: string | null;
        legalName: string | null;
        traccarGeofenceId: number | null;
        logoUrl: string | null;
        type: import(".prisma/client").$Enums.CustomerType;
        status: import(".prisma/client").$Enums.CustomerStatus;
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
        address: string | null;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        reference: string;
        email: string | null;
        phone: string | null;
        taxId: string | null;
        legalName: string | null;
        traccarGeofenceId: number | null;
        logoUrl: string | null;
        type: import(".prisma/client").$Enums.CustomerType;
        status: import(".prisma/client").$Enums.CustomerStatus;
    }>;
    listSites(customerId: string): Promise<({
        _count: {
            workOrders: number;
            equipment: number;
        };
    } & {
        id: string;
        address: string;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        customerId: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        traccarGeofenceId: number | null;
    })[]>;
    profile(id: string): Promise<{
        customer: {
            _count: {
                workOrders: number;
                sites: number;
                quotes: number;
                payments: number;
                meetings: number;
            };
            workOrders: ({
                site: {
                    id: string;
                    address: string;
                    name: string;
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
                    workOrderId: string | null;
                    createdAt: Date;
                    type: import(".prisma/client").$Enums.InventoryMovementType;
                    itemId: string;
                    quantity: number;
                    stockAfter: number;
                    reason: string | null;
                    installedDeviceId: string | null;
                })[];
            } & {
                id: string;
                title: string;
                customerId: string;
                siteId: string | null;
                scheduledAt: Date | null;
                notes: string | null;
                createdAt: Date;
                updatedAt: Date;
                type: import(".prisma/client").$Enums.ServiceType;
                status: import(".prisma/client").$Enums.WorkOrderStatus;
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
                address: string;
                latitude: Prisma.Decimal | null;
                longitude: Prisma.Decimal | null;
                customerId: string;
                notes: string | null;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                traccarGeofenceId: number | null;
            })[];
            quotes: {
                number: string;
                id: string;
                title: string;
                customerId: string;
                createdAt: Date;
                updatedAt: Date;
                currency: string;
                status: import(".prisma/client").$Enums.QuoteStatus;
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
                meetingId: string | null;
            }[];
            payments: {
                id: string;
                customerId: string;
                createdAt: Date;
                updatedAt: Date;
                concept: string;
                amount: Prisma.Decimal;
                dueDate: Date | null;
                paidAt: Date | null;
            }[];
            documents: {
                id: string;
                customerId: string;
                createdAt: Date;
                name: string;
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
            address: string | null;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            reference: string;
            email: string | null;
            phone: string | null;
            taxId: string | null;
            legalName: string | null;
            traccarGeofenceId: number | null;
            logoUrl: string | null;
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
            address: string;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            customerId: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            traccarGeofenceId: number | null;
        })[];
        workOrders: ({
            site: {
                id: string;
                address: string;
                name: string;
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
                workOrderId: string | null;
                createdAt: Date;
                type: import(".prisma/client").$Enums.InventoryMovementType;
                itemId: string;
                quantity: number;
                stockAfter: number;
                reason: string | null;
                installedDeviceId: string | null;
            })[];
        } & {
            id: string;
            title: string;
            customerId: string;
            siteId: string | null;
            scheduledAt: Date | null;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.ServiceType;
            status: import(".prisma/client").$Enums.WorkOrderStatus;
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
                address: string;
                name: string;
                customer: {
                    id: string;
                    name: string;
                };
            };
            inventoryMovements: {
                id: string;
                workOrderId: string | null;
                createdAt: Date;
                workOrder: {
                    id: string;
                    title: string;
                    scheduledAt: Date | null;
                    status: import(".prisma/client").$Enums.WorkOrderStatus;
                    completedAt: Date | null;
                } | null;
            }[];
        } & {
            id: string;
            siteId: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
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
            title: string;
            customerId: string;
            createdAt: Date;
            updatedAt: Date;
            currency: string;
            status: import(".prisma/client").$Enums.QuoteStatus;
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
            meetingId: string | null;
        }[];
        payments: {
            id: string;
            customerId: string;
            createdAt: Date;
            updatedAt: Date;
            concept: string;
            amount: Prisma.Decimal;
            dueDate: Date | null;
            paidAt: Date | null;
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
            customerId: string;
            createdAt: Date;
            name: string;
            mimeType: string | null;
            size: number | null;
            dataUrl: string;
        }[];
    }>;
    createDocument(customerId: string, dto: CreateCustomerDocumentDto): Promise<{
        id: string;
        customerId: string;
        createdAt: Date;
        name: string;
        mimeType: string | null;
        size: number | null;
        dataUrl: string;
    }>;
    deleteDocument(customerId: string, documentId: string): Promise<{
        id: string;
        customerId: string;
        createdAt: Date;
        name: string;
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
        address: string;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        customerId: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
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
