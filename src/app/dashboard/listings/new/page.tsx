import ListingForm from "@/components/ListingForm";

export default function NewListingPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-900">Đăng tin mới</h1>
      <div className="mt-6">
        <ListingForm />
      </div>
    </div>
  );
}
