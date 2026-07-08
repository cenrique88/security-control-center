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
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
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
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
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
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        traccarGeofenceId: number | null;
        logoUrl: string | null;
    }>;
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
                amount: import("@prisma/client/runtime/library").Decimal;
                quantity: number | null;
                unitPrice: import("@prisma/client/runtime/library").Decimal | null;
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
                    unitCost: import("@prisma/client/runtime/library").Decimal | null;
                    totalCost: import("@prisma/client/runtime/library").Decimal | null;
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
                reportPhotos: import("@prisma/client/runtime/library").JsonValue | null;
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
                latitude: import("@prisma/client/runtime/library").Decimal | null;
                longitude: import("@prisma/client/runtime/library").Decimal | null;
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
                total: import("@prisma/client/runtime/library").Decimal;
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
                costTotal: import("@prisma/client/runtime/library").Decimal;
                estimatedProfit: import("@prisma/client/runtime/library").Decimal;
                estimatedMargin: import("@prisma/client/runtime/library").Decimal;
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
                estimatedBudget: import("@prisma/client/runtime/library").Decimal | null;
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
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
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
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
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
                unitCost: import("@prisma/client/runtime/library").Decimal | null;
                totalCost: import("@prisma/client/runtime/library").Decimal | null;
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
            reportPhotos: import("@prisma/client/runtime/library").JsonValue | null;
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
            total: import("@prisma/client/runtime/library").Decimal;
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
            costTotal: import("@prisma/client/runtime/library").Decimal;
            estimatedProfit: import("@prisma/client/runtime/library").Decimal;
            estimatedMargin: import("@prisma/client/runtime/library").Decimal;
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
            amount: import("@prisma/client/runtime/library").Decimal;
            quantity: number | null;
            unitPrice: import("@prisma/client/runtime/library").Decimal | null;
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
            estimatedBudget: import("@prisma/client/runtime/library").Decimal | null;
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
    listSites(id: string): Promise<({
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
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        traccarGeofenceId: number | null;
    })[]>;
    createSite(id: string, dto: CreateSiteDto): Promise<{
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
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        traccarGeofenceId: number | null;
    }>;
    createDocument(id: string, dto: CreateCustomerDocumentDto): Promise<{
        id: string;
        name: string;
        customerId: string;
        createdAt: Date;
        mimeType: string | null;
        size: number | null;
        dataUrl: string;
    }>;
    deleteDocument(id: string, documentId: string): Promise<{
        id: string;
        name: string;
        customerId: string;
        createdAt: Date;
        mimeType: string | null;
        size: number | null;
        dataUrl: string;
    }>;
}
