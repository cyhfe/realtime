import { PropsWithChildren } from "react";

export function Music() {
  return (
    <Fullscreen>
      <div className="flex h-full flex-col">
        <div className="shrink-0 grow-0 bg-white">header</div>
        <div className="flex grow flex-col overflow-hidden bg-slate-200">
          <div className="grow overflow-y-scroll">
            <div
              style={{
                height: "1000px",
              }}
              // className="overflow-y-scroll"
            >
              canvas
            </div>
          </div>
          <div className="shrink-0 grow-0 bg-white">keyboard</div>
        </div>
      </div>
    </Fullscreen>
  );
}

function Fullscreen({ children }: PropsWithChildren) {
  return (
    <div className="relative flex h-full w-full  overflow-hidden bg-slate-100 text-base text-slate-600">
      <div className="h-full w-full">{children}</div>
    </div>
  );
}
