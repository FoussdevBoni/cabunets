// pages/NewNotificationPage.tsx
import NotificationForm from "../../components/features/notifications/NotificationForm";
import PageLayout from "../../layouts/PageLayout";
import PageLitLayout from "../../layouts/PageListLayout";

export default function NewNotificationPage() {
  return (
    <PageLayout title="Nouvelle notification" >
    

      <div className="px-6 py-8 max-w-4xl mx-auto">
        <NotificationForm />
      </div>
    </PageLayout>
  );
}