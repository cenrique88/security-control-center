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
            workOrders: number;
            sites: number;
            quotes: number;
            payments: number;
            meetings: number;
        };
    } & {
        id: string;
        reference: string;
        name: string;
        legalName: string | null;
        taxId: string | null;
        email: string | null;
        phone: string | null;
        address: string | null;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        traccarGeofenceId: number | null;
        logoUrl: string | null;
        type: import(".prisma/client").$Enums.CustomerType;
        status: import(".prisma/client").$Enums.CustomerStatus;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
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
        reference: string;
        name: string;
        legalName: string | null;
        taxId: string | null;
        email: string | null;
        phone: string | null;
        address: string | null;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        traccarGeofenceId: number | null;
        logoUrl: string | null;
        type: import(".prisma/client").$Enums.CustomerType;
        status: import(".prisma/client").$Enums.CustomerStatus;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
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
        reference: string;
        name: string;
        legalName: string | null;
        taxId: string | null;
        email: string | null;
        phone: string | null;
        address: string | null;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        traccarGeofenceId: number | null;
        logoUrl: string | null;
        type: import(".prisma/client").$Enums.CustomerType;
        status: import(".prisma/client").$Enums.CustomerStatus;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        type: import(".prisma/client").$Enums.CustomerType;
    }>;
    profile(id: string): Promise<{
        customer: {
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
                        brand: string | null;
                        model: string | null;
                        serial: string | null;
                        ipAddress: string | null;
                    } | null;
                } & {
                    id: string;
                    type: import(".prisma/client").$Enums.InventoryMovementType;
                    createdAt: Date;
                    customerId: string | null;
                    currency: string | null;
                    quantity: number;
                    workOrderId: string | null;
                    sourceType: string | null;
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
                type: import(".prisma/client").$Enums.ServiceType;
                status: import(".prisma/client").$Enums.WorkOrderStatus;
                notes: string | null;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                scheduledAt: Date | null;
                completedAt: Date | null;
                reportBeforeNotes: string | null;
                reportAfterNotes: string | null;
                reportTasks: string | null;
                reportTests: string | null;
                reportRecommendations: string | null;
                reportPhotos: import("@prisma/client/runtime/library").JsonValue | null;
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
                address: string;
                latitude: import("@prisma/client/runtime/library").Decimal | null;
                longitude: import("@prisma/client/runtime/library").Decimal | null;
                traccarGeofenceId: number | null;
                notes: string | null;
                createdAt: Date;
                updatedAt: Date;
                customerId: string;
            })[];
            quotes: {
                number: string;
                id: string;
                status: import(".prisma/client").$Enums.QuoteStatus;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                customerId: string;
                service: import(".prisma/client").$Enums.ServiceType;
                pricingMode: import(".prisma/client").$Enums.QuotePricingMode;
                currency: string;
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
                reference: string | null;
                notes: string | null;
                createdAt: Date;
                updatedAt: Date;
                customerId: string;
                currency: string;
                transactionType: string;
                category: string;
                concept: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                quantity: number | null;
                unitPrice: import("@prisma/client/runtime/library").Decimal | null;
                method: string | null;
                dueDate: Date | null;
                paidAt: Date | null;
                quoteId: string | null;
                workOrderId: string | null;
                vehicleId: string | null;
                inventoryItemId: string | null;
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
                type: import(".prisma/client").$Enums.MeetingType;
                status: import(".prisma/client").$Enums.MeetingStatus;
                notes: string | null;
                createdAt: Date;
                updatedAt: Date;
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
            _count: {
                workOrders: number;
                sites: number;
                quotes: number;
                payments: number;
                meetings: number;
            };
        } & {
            id: string;
            reference: string;
            name: string;
            legalName: string | null;
            taxId: string | null;
            email: string | null;
            phone: string | null;
            address: string | null;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
            traccarGeofenceId: number | null;
            logoUrl: string | null;
            type: import(".prisma/client").$Enums.CustomerType;
            status: import(".prisma/client").$Enums.CustomerStatus;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        sites: ({
            _count: {
                workOrders: number;
                equipment: number;
            };
        } & {
            id: string;
            name: string;
            address: string;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
            traccarGeofenceId: number | null;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
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
                    brand: string | null;
                    model: string | null;
                    serial: string | null;
                    ipAddress: string | null;
                } | null;
            } & {
                id: string;
                type: import(".prisma/client").$Enums.InventoryMovementType;
                createdAt: Date;
                customerId: string | null;
                currency: string | null;
                quantity: number;
                workOrderId: string | null;
                sourceType: string | null;
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
            type: import(".prisma/client").$Enums.ServiceType;
            status: import(".prisma/client").$Enums.WorkOrderStatus;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            scheduledAt: Date | null;
            completedAt: Date | null;
            reportBeforeNotes: string | null;
            reportAfterNotes: string | null;
            reportTasks: string | null;
            reportTests: string | null;
            reportRecommendations: string | null;
            reportPhotos: import("@prisma/client/runtime/library").JsonValue | null;
            siteId: string | null;
            customerId: string;
        })[];
        equipment: ({
            inventoryMovements: {
                id: string;
                createdAt: Date;
                workOrder: {
                    id: string;
                    status: import(".prisma/client").$Enums.WorkOrderStatus;
                    title: string;
                    scheduledAt: Date | null;
                    completedAt: Date | null;
                } | null;
                workOrderId: string | null;
            }[];
            site: {
                customer: {
                    id: string;
                    name: string;
                };
                id: string;
                name: string;
                address: string;
            };
        } & {
            id: string;
            type: import(".prisma/client").$Enums.ServiceType;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
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
            status: import(".prisma/client").$Enums.QuoteStatus;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            customerId: string;
            service: import(".prisma/client").$Enums.ServiceType;
            pricingMode: import(".prisma/client").$Enums.QuotePricingMode;
            currency: string;
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
            reference: string | null;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            currency: string;
            transactionType: string;
            category: string;
            concept: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            quantity: number | null;
            unitPrice: import("@prisma/client/runtime/library").Decimal | null;
            method: string | null;
            dueDate: Date | null;
            paidAt: Date | null;
            quoteId: string | null;
            workOrderId: string | null;
            vehicleId: string | null;
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
            type: import(".prisma/client").$Enums.MeetingType;
            status: import(".prisma/client").$Enums.MeetingStatus;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
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
        address: string;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        traccarGeofenceId: number | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
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
        address: string;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        traccarGeofenceId: number | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
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
