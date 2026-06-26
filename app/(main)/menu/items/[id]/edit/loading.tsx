import { Spinner } from "@/components/ui/spinner";

const loading = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <Spinner className="size-10"/>
    </div>
  );
};

export default loading;
