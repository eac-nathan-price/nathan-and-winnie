import { Game } from "./_types";

export const hf24 = {
  title: "Hanukkah Feud 2024",
  rounds: [
    {
      title: "Round 1",
      type: "tossup",
      multiplier: 1,
      questions: [
        {
          text: "What food do you wish was kosher?",
          answers: [
            { points: 31, text: "Bacon / Pork" },
            { points: 24, text: "Shellfish" },
            { points: 19, text: "Cheeseburger / Cheesesteak" },
            { points: 12, text: "Gelatin / Animal-byproducts" },
            { points: 9, text: "Chicken Parm" }
          ],
        },
        {
          text: "Who is the funniest Jewish Celebrity?",
          answers: [
            { points: 26, text: "Mel Brooks" },
            { points: 19, text: "Adam Sandler" },
            { points: 16, text: "Larry David" },
            { points: 13, text: "Jerry Seinfeld" },
            { points: 11, text: "Sacha Baron Cohen" },
            { points: 10, text: "Andy Samberg" }
          ]
        }
      ]
    },
    {
      title: "Round 2",
      type: "tossup",
      multiplier: 2,
      questions: [
        {
          text: "What is the biggest sign a stranger might be Jewish?",
          answers: [
            { points: 29, text: "Kippah / Tzitzit" },
            { points: 16, text: "Jewelry" },
            { points: 15, text: "Physical features" },
            { points: 10, text: "Name" },
            { points: 9, text: "Complaining / Opinionated" },
            { points: 8, text: "Eating Jewish food" },
            { points: 7, text: "Speaking Hebrew / Yiddish" }
          ],
        },
        {
          text: "Why might 2 Jews be having an argument?",
          answers: [
            { points: 29, text: "Day ending in 'y' (anything)" },
            { points: 18, text: "Food" },
            { points: 16, text: "Jewish custom" },
            { points: 12, text: "Haggling / Money" },
            { points: 10, text: "Politics" },
            { points: 9, text: "Sports" }
          ]
        }
      ]
    },
    {
      title: "Round 3",
      type: "tossup",
      multiplier: 3,
      questions: [
        {
          text: "What is the worst place to run into your rabbi?",
          answers: [
            { points: 23, text: "Strip club" },
            { points: 19, text: "Adult store" },
            { points: 16, text: "With non-kosher food" },
            { points: 12, text: "Mikvah" },
            { points: 10, text: "Date / Dating-app" },
            { points: 9, text: "Another Temple / Church" },
            { points: 6, text: "Bathroom / Locker-room" }
          ]
        },
        {
          text: "What can you say at a bris that you can also say at the deli?",
          answers: [
            { points: 22, text: "Slice it thin" },
            { points: 19, text: "A little off the end" },
            { points: 15, text: "That's too much" },
            { points: 10, text: "Nice cut" },
            { points: 9, text: "Sharpen the knife" },
            { points: 8, text: "They were a bit short (not enough)" },
            { points: 7, text: "Keep the tip" },
            { points: 5, text: "Wrap it well" }
          ]
        }
      ]
    },
    {
      title: "Tiebreaker",
      type: "tiebreak",
      multiplier: 1,
      questions: [
        {
          text: "What should the 11th commandment be?",
          answers: [
            { points: 19, text: "Don't mess up the meal" },
            { points: 15, text: "Golden rule (treat others the way you want to be treated)" },
            { points: 12, text: "Call your parents / grandparents" },
            { points: 9, text: "Support Israel" },
            { points: 7, text: "Don't discuss politics" },
            { points: 6, text: "Give tzedakah" },
            { points: 6, text: "Don't forget your anniversary" },
            { points: 5, text: "Don't overpay" }
          ]
        }
      ]
    },
    {
      title: "Dreidel Round",
      type: "rapid",
      multiplier: 1,
      questions: [
        {
          text: "On a scale of 1 to 10 how accurate is your Jewdar?",
          answers: [
            { points: 0, text: "1" },
            { points: 0, text: "2" },
            { points: 3, text: "3" },
            { points: 6, text: "4" },
            { points: 7, text: "5" },
            { points: 10, text: "6" },
            { points: 19, text: "7" },
            { points: 27, text: "8" },
            { points: 20, text: "9" },
            { points: 8, text: "10" }
          ]
        },
        {
          text: "What is an excuse for why you weren't at services?",
          answers: [
            { points: 25, text: "Sick"  },
            { points: 24, text: "Traffic / Problem on the way" },
            { points: 21, text: "Overslept" },
            { points: 15, text: "Vacation" },
            { points: 14, text: "With family" }
          ]
        },
        {
          text: "What job did your parents want you to do?",
          answers: [
            { points: 38, text: "Lawyer" },
            { points: 28, text: "Doctor" },
            { points: 16, text: "Engineer / Scientist" },
            { points: 7, text: "Rabbi" },
            { points: 6, text: "Dentist / Orthodontist" },
            { points: 3, text: "Homemaker" }
          ]
        },
        {
          text: "What is the best item at the Jewish bakery?",
          answers: [
            { points: 31, text: "Babka" },
            { points: 29, text: "Rugelach" },
            { points: 21, text: "Challah" },
            { points: 6, text: "Bagels" },
            { points: 5, text: "Black and White" },
            { points: 4, text: "Marble Cake" },
            { points: 3, text: "Cheese Danish" }
          ]
        },
        {
          text: "Which celebrity has the most shiksappeal?",
          answers: [
            { points: 20, text: "Kristen Bell" },
            { points: 12, text: "Margot Robbie" },
            { points: 9, text: "Rachel Brosnahan" },
            { points: 6, text: "Anna Kendrick" },
            { points: 6, text: "Scarlett Johansson" },
            { points: 4, text: "Jennifer Aniston" },
            { points: 4, text: "Marisa Tomei" },
            { points: 4, text: "Julia Louis Dreyfus" },
            { points: 4, text: "Blake Lively" },
            { points: 4, text: "Ebon Moss-Bachrach" },
            { points: 4, text: "Kathryn Hahn" },
            { points: 4, text: "Shania Twain" },
            { points: 4, text: "Selena Gomez" },
            { points: 4, text: "Noomi Rapace" },
            { points: 4, text: "Patti Lupone" }
          ]
        },
        {
          text: "What is the best Yiddish curse / insult?",
          answers: [
            { points: 19, text: "schmuck / schmeckle" },
            { points: 15, text: "gey kokken (poop in sea)" },
            { points: 10, text: "Az es kumt (teeth fall out)" },
            { points: 6, text: "goysche kopf" },
            { points: 6, text: "shlemiel" },
            { points: 6, text: "shmegegge" },
            { points: 6, text: "farshtunken" },
            { points: 6, text: "mieskeit" },
            { points: 6, text: "meshuggah / meshugannah" },
            { points: 5, text: "Drecklemeister (master of shit)" },
            { points: 4, text: "Putz" },
            { points: 4, text: "Nebbish" },
            { points: 4, text: "Zol er krenken" }
          ]
        },
        {
          text: "Which traditional food is the worst?",
          answers: [
            { points: 47, text: "gefilte fish" },
            { points: 12, text: "kishka" },
            { points: 9, text: "borscht" },
            { points: 6, text: "p'tcha" },
            { points: 6, text: "cholent" },
            { points: 5, text: "Manischewitz" },
            { points: 4, text: "Kasha" },
            { points: 4, text: "Chopped liver" },
            { points: 3, text: "Tongue" }
          ]
        },
        {
          text: "How many Jewish holidays do you observe?",
          answers: [
            { points: 0, text: "None" },
            { points: 0, text: "1-2" },
            { points: 14, text: "3-4" },
            { points: 24, text: "5-6" },
            { points: 13, text: "7-8" },
            { points: 10, text: "9-10" },
            { points: 8, text: "11-12" },
            { points: 6, text: "13-14" },
            { points: 25, text: "15+" }
          ]
        }
      ]
    }
  ]
} as Game;
