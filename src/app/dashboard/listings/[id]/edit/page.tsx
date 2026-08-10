import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/utils";
import ListingForm from "@/components/ListingForm";

export default async function EditListingPage({ params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) return notFound();

  const defaultValues = {
    unitCode: listing.unitCode,
    title: listing.title,
    projectId: listing.projectId || "",
    block: listing.block || "",
    floor: listing.floor || "",
    address: listing.address || "",
    provinceId: listing.provinceId || "",
    transactionType: listing.transactionType,
    salePrice: listing.salePrice?.toString() || "",
    rentPrice: listing.rentPrice?.toString() || "",
    propertyType: listing.propertyType,
    area: listing.area.toString(),
    bedrooms: listing.bedrooms?.toString() || "",
    bathrooms: listing.bathrooms?.toString() || "",
    doorDirection: listing.doorDirection || "",
    balconyDirection: listing.balconyDirection || "",
    view: listing.view || "",
    furnitureStatus: listing.furnitureStatus || "",
    legalStatus: listing.legalStatus || "",
    unitStatus: listing.unitStatus,
    description: listing.description || "",
    imagesText: parseImages(listing.images).join("\n"),
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-900">Sửa tin đăng — {listing.unitCode}</h1>
      <div className="mt-6">
        <ListingForm listingId={listing.id} defaultValues={defaultValues as any} />
      </div>
    </div>
  );
}
