import { CustomerType } from "@prisma/client";
import { CustomersService } from "./customers.service";
import { CreateCustomerDocumentDto } from "./dto/create-customer-document.dto";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { CreateSiteDto } from "./dto/create-site.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    list(search?: string, status?: "ACTIVE" | "PROSPECT" | "INACTIVE", type?: CustomerType): Promise<({
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
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        status: import(".prisma/client").$Enums.CustomerStatus;
        phone: string | null;
        reference: string;
        legalName: string | null;
        taxId: string | null;
        email: string | null;
        address: string | null;
        traccarGeofenceId: number | null;
        type: import(".prisma/client").$Enums.CustomerType;
        notes: string | null;
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
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        status: import(".prisma/client").$Enums.CustomerStatus;
        phone: string | null;
        reference: string;
        legalName: string | null;
        taxId: string | null;
        email: string | null;
        address: string | null;
        traccarGeofenceId: number | null;
        type: import(".prisma/client").$Enums.CustomerType;
        notes: string | null;
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
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        status: import(".prisma/client").$Enums.CustomerStatus;
        phone: string | null;
        reference: string;
        legalName: string | null;
        taxId: string | null;
        email: string | null;
        address: string | null;
        traccarGeofenceId: number | null;
        type: import(".prisma/client").$Enums.CustomerType;
        notes: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        type: import(".prisma/client").$Enums.CustomerType;
    }>;
    profile(id: string): Promise<{
        customer: {
            payments: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                vehicleId: string | null;
                reference: string | null;
                notes: string | null;
                customerId: string;
                method: string | null;
                workOrderId: string | null;
                category: string;
                currency: string;
                quoteId: string | null;
                transactionType: string;
                concept: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                quantity: number | null;
                unitPrice: import("@prisma/client/runtime/library").Decimal | null;
                dueDate: Date | null;
                paidAt: Date | null;
                inventoryItemId: string | null;
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
                    type: import(".prisma/client").$Enums.InventoryMovementType;
                    customerId: string | null;
                    workOrderId: string | null;
                    sourceType: string | null;
                    currency: string | null;
                    quoteId: string | null;
                    quantity: number;
                    stockAfter: number;
                    unitCost: import("@prisma/client/runtime/library").Decimal | null;
                    totalCost: import("@prisma/client/runtime/library").Decimal | null;
                    reason: string | null;
                    itemId: string;
                    paymentId: string | null;
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
                status: import(".prisma/client").$Enums.WorkOrderStatus;
                type: import(".prisma/client").$Enums.ServiceType;
                notes: string | null;
                customerId: string;
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
                reportPhotos: import("@prisma/client/runtime/library").JsonValue | null;
                quoteId: string | null;
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
                latitude: import("@prisma/client/runtime/library").Decimal | null;
                longitude: import("@prisma/client/runtime/library").Decimal | null;
                address: string;
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
                customerId: string;
                title: string;
                currency: string;
                service: import(".prisma/client").$Enums.ServiceType;
                pricingMode: import(".prisma/client").$Enums.QuotePricingMode;
                issueDate: Date;
                validUntil: Date | null;
                taxIncluded: boolean;
                discountPercent: import("@prisma/client/runtime/library").Decimal;
                profitMarginPercent: import("@prisma/client/runtime/library").Decimal;
                laborPoints: import("@prisma/client/runtime/library").Decimal;
                materialsSubtotal: import("@prisma/client/runtime/library").Decimal;
                laborSubtotal: import("@prisma/client/runtime/library").Decimal;
                expensesSubtotal: import("@prisma/client/runtime/library").Decimal;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                taxableBase: import("@prisma/client/runtime/library").Decimal;
                tax: import("@prisma/client/runtime/library").Decimal;
                total: import("@prisma/client/runtime/library").Decimal;
                costTotal: import("@prisma/client/runtime/library").Decimal;
                estimatedProfit: import("@prisma/client/runtime/library").Decimal;
                estimatedMargin: import("@prisma/client/runtime/library").Decimal;
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
                status: import(".prisma/client").$Enums.MeetingStatus;
                type: import(".prisma/client").$Enums.MeetingType;
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
                estimatedBudget: import("@prisma/client/runtime/library").Decimal | null;
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
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
            status: import(".prisma/client").$Enums.CustomerStatus;
            phone: string | null;
            reference: string;
            legalName: string | null;
            taxId: string | null;
            email: string | null;
            address: string | null;
            traccarGeofenceId: number | null;
            type: import(".prisma/client").$Enums.CustomerType;
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
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
            address: string;
            traccarGeofenceId: number | null;
            notes: string | null;
            customerId: string;
        })[];
        workOrders: ({
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
                type: import(".prisma/client").$Enums.InventoryMovementType;
                customerId: string | null;
                workOrderId: string | null;
                sourceType: string | null;
                currency: string | null;
                quoteId: string | null;
                quantity: number;
                stockAfter: number;
                unitCost: import("@prisma/client/runtime/library").Decimal | null;
                totalCost: import("@prisma/client/runtime/library").Decimal | null;
                reason: string | null;
                itemId: string;
                paymentId: string | null;
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
            status: import(".prisma/client").$Enums.WorkOrderStatus;
            type: import(".prisma/client").$Enums.ServiceType;
            notes: string | null;
            customerId: string;
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
            reportPhotos: import("@prisma/client/runtime/library").JsonValue | null;
            quoteId: string | null;
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
            type: import(".prisma/client").$Enums.ServiceType;
            notes: string | null;
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
            status: import(".prisma/client").$Enums.QuoteStatus;
            customerId: string;
            title: string;
            currency: string;
            service: import(".prisma/client").$Enums.ServiceType;
            pricingMode: import(".prisma/client").$Enums.QuotePricingMode;
            issueDate: Date;
            validUntil: Date | null;
            taxIncluded: boolean;
            discountPercent: import("@prisma/client/runtime/library").Decimal;
            profitMarginPercent: import("@prisma/client/runtime/library").Decimal;
            laborPoints: import("@prisma/client/runtime/library").Decimal;
            materialsSubtotal: import("@prisma/client/runtime/library").Decimal;
            laborSubtotal: import("@prisma/client/runtime/library").Decimal;
            expensesSubtotal: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            discountAmount: import("@prisma/client/runtime/library").Decimal;
            taxableBase: import("@prisma/client/runtime/library").Decimal;
            tax: import("@prisma/client/runtime/library").Decimal;
            total: import("@prisma/client/runtime/library").Decimal;
            costTotal: import("@prisma/client/runtime/library").Decimal;
            estimatedProfit: import("@prisma/client/runtime/library").Decimal;
            estimatedMargin: import("@prisma/client/runtime/library").Decimal;
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
            vehicleId: string | null;
            reference: string | null;
            notes: string | null;
            customerId: string;
            method: string | null;
            workOrderId: string | null;
            category: string;
            currency: string;
            quoteId: string | null;
            transactionType: string;
            concept: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            quantity: number | null;
            unitPrice: import("@prisma/client/runtime/library").Decimal | null;
            dueDate: Date | null;
            paidAt: Date | null;
            inventoryItemId: string | null;
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
            status: import(".prisma/client").$Enums.MeetingStatus;
            type: import(".prisma/client").$Enums.MeetingType;
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
            estimatedBudget: import("@prisma/client/runtime/library").Decimal | null;
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
    listSites(id: string): Promise<({
        _count: {
            workOrders: number;
            equipment: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        address: string;
        traccarGeofenceId: number | null;
        notes: string | null;
        customerId: string;
    })[]>;
    createSite(id: string, dto: CreateSiteDto): Promise<{
        _count: {
            workOrders: number;
            equipment: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        address: string;
        traccarGeofenceId: number | null;
        notes: string | null;
        customerId: string;
    }>;
    createDocument(id: string, dto: CreateCustomerDocumentDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        customerId: string;
        mimeType: string | null;
        size: number | null;
        dataUrl: string;
    }>;
    deleteDocument(id: string, documentId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        customerId: string;
        mimeType: string | null;
        size: number | null;
        dataUrl: string;
    }>;
}
