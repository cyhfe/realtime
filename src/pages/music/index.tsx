import { PropsWithChildren, useEffect, useRef, useState } from "react";
import { Midi } from "@tonejs/midi";
import * as Tone from "tone";

export function Music() {
  const [midi, setMidi] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  useEffect(() => {
    async function parseMidi() {
      const midi = await Midi.fromUrl("/midi/chopin_op27_1.mid");
      //get the tracks
      setMidi(midi);
    }
    parseMidi();
  }, []);

  // tonejs transport schedule
  useEffect(() => {
    
  })

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    container.scrollTo(0, scrollHeight - clientHeight);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isPlaying) return;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    function update() {
      if (!container) return;
      console.log("update");
      const offset = container.scrollTop;
      container.scrollTo(0, offset - 1);
      requestAnimationFrame(update);
    }
    const raf = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(raf);
    };
  }, [isPlaying]);

  return (
    <Fullscreen>
      <div className="flex h-full flex-col">
        <div className="shrink-0 grow-0 bg-white">
          <button
            onClick={async () => {
              if (!midi) return;

              await Tone.start();
              console.log(midi);
              midi.tracks.forEach((track: any) => {
                //tracks have notes and controlChanges
                //notes are an array
                const synth = new Tone.PolySynth(Tone.Synth).toDestination();

                const notes = track.notes;
                if (!notes) return;
                notes.forEach((note: any) => {
                  //note.midi, note.time, note.duration, note.name
                  // console.log(note, Tone.now());
                  console.log(note)
                  synth.triggerAttackRelease(
                    note.name,
                    note.duration,
                    note.time,
                    note.velocity
                  );
                });

                //the control changes are an object
                //the keys are the CC number
                // track.controlChanges[64];
                //they are also aliased to the CC number's common name (if it has one)
                track.controlChanges.sustain?.forEach((cc: any) => {
                  // cc.ticks, cc.value, cc.time
                  console.log(cc, "cc");
                });

                //the track also has a channel and instrument
                //track.instrument.name
                console.log(track.instrument.name);
              });
            }}
          >
            play
          </button>
        </div>
        <div className="flex grow flex-col overflow-hidden bg-slate-200">
          <div className="grow overflow-hidden">
            <div className="relative h-full w-full">
              <div
                className="absolute bottom-0 left-0 right-0 top-0 overflow-y-scroll"
                ref={containerRef}
                onScroll={(e: any) => {
                  const el = e.target;
                  console.log(el.clientHeight, el.scrollHeight, el.scrollTop);
                }}
              >
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={1000}
                  className="grow  bg-rose-400"
                />
              </div>
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
