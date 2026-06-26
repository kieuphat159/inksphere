import { PropsWithChildren } from "react";
const AuthLayout = ({ children }: React.PropsWithChildren) => {
    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-background px-4 py-12">
            {children}
        </div>
    );
}

export default AuthLayout;