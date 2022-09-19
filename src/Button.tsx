import { ReactNode } from "react";

function Button({
  children,
  onClick: handleClick,
  className = "",
  type = "button",
}: {
  children?: ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
}) {
  return (
    <button
      type={type}
      onClick={handleClick}
      className={
        "rounded-lg border-2 border-transparent bg-zinc-50 p-2 text-zinc-900 shadow-blue-500 drop-shadow-md hover:border-blue-500 hover:bg-zinc-100 hover:shadow-lg active:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:hover:backdrop-brightness-75 dark:active:bg-zinc-800 " +
        className
      }
    >
      {children}
    </button>
  );
}

export default Button;
