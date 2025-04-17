export const Footer = () => {
  return (
    <footer className="flex border-t justify-center font-medium p-6">
      <div className="flex items-center gap-2">
        <p>&copy; {new Date().getFullYear()} StoreHub. All rights reserved.</p>
      </div>
    </footer>
  );
};
