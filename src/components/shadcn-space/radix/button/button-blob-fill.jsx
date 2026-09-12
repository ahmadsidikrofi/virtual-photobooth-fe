import { Button } from "@/components/ui/button";

const ButtonBlobFill = ({ name, onClick, className, ...props }) => {
  return (
    <Button
      onClick={onClick}
      className={`relative overflow-hidden group px-4 py-2 h-auto rounded-full font-medium text-base cursor-pointer border border-primary transition-all ${className}`}
      {...props}
    >
      <span className="absolute left-1/2 -translate-x-1/2 top-full -translate-y-1/2 w-8 h-8 bg-white dark:bg-gray-950 rounded-full scale-0 transition-transform duration-700 ease-in-out group-hover:scale-[18]" />
      <span className="font-bold relative z-10 transition-colors duration-500 group-hover:text-gray-950 dark:group-hover:text-white">
        {name}
      </span>
    </Button>
  );
};

export default ButtonBlobFill;
