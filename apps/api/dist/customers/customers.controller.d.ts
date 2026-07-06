import { CustomersService } from "./customers.service";
import { CreateCustomerDocumentDto } from "./dto/create-customer-document.dto";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { CreateSiteDto } from "./dto/create-site.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    list(search?: string, status?: "ACTIVE" | "PROSPECT" | "INACTIVE", type?: "NORMAL" | "THIRD_PARTY"): Promise<({
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
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
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
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
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
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
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
                reportPhotos: import("@prisma/client/runtime/library").JsonValue | null;
            })[];
            sites: ({
                _count: {
                    workOrders: number;
                    equipment: number;
                };
            } & {
                id: string;
                address: string;
                latitude: import("@prisma/client/runtime/library").Decimal | null;
                longitude: import("@prisma/client/runtime/library").Decimal | null;
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
                customerId: string;
                createdAt: Date;
                updatedAt: Date;
                concept: string;
                amount: import("@prisma/client/runtime/library").Decimal;
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
                estimatedBudget: import("@prisma/client/runtime/library").Decimal | null;
                closeProbability: number | null;
                reminderEnabled: boolean;
                reminderMinutesBefore: number;
                reminderSentAt: Date | null;
            })[];
        } & {
            id: string;
            address: string | null;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
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
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
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
            reportPhotos: import("@prisma/client/runtime/library").JsonValue | null;
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
            customerId: string;
            createdAt: Date;
            updatedAt: Date;
            concept: string;
            amount: import("@prisma/client/runtime/library").Decimal;
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
            estimatedBudget: import("@prisma/client/runtime/library").Decimal | null;
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
    listSites(id: string): Promise<({
        _count: {
            workOrders: number;
            equipment: number;
        };
    } & {
        id: string;
        address: string;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        customerId: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        traccarGeofenceId: number | null;
    })[]>;
    createSite(id: string, dto: CreateSiteDto): Promise<{
        _count: {
            workOrders: number;
            equipment: number;
        };
    } & {
        id: string;
        address: string;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        customerId: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        traccarGeofenceId: number | null;
    }>;
    createDocument(id: string, dto: CreateCustomerDocumentDto): Promise<{
        id: string;
        customerId: string;
        createdAt: Date;
        name: string;
        mimeType: string | null;
        size: number | null;
        dataUrl: string;
    }>;
    deleteDocument(id: string, documentId: string): Promise<{
        id: string;
        customerId: string;
        createdAt: Date;
        name: string;
        mimeType: string | null;
        size: number | null;
        dataUrl: string;
    }>;
}
