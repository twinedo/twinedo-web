
import { generateRandomLightColor } from '../../utils/color';
import { Section } from '../section';
import { Timeline } from '../timeline';

export function Education() {
  return (
    <div className="bg-gradient-to-b from-[#add8e6] to-[#c2cdd1]">
      <Section>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col space-y-5">
            <div className="flex flex-row items-center space-x-4">
              <p className="font-bold text-base tracking-[0.3em]">
                EDUCATION
              </p>
              <div className="h-[3px] w-[45px] bg-black" />
            </div>

            <Timeline
              dateText='2013 - 2017'
              bgCard={generateRandomLightColor()}
            >
              <p className="font-bold">
                Informatics Engineering - Gunadarma University
              </p>
              <p>Bachelor`s degree graduate</p>
            </Timeline>
          </div>
        </div>
      </Section>
    </div>
  );
}