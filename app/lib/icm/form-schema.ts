import { z } from "zod";

/**
 * Stack được giữ dưới dạng string trong form.
 * Chỉ chuyển thành number khi bắt đầu tính ICM.
 */
const stackSchema = z
  .string()
  .trim()
  .min(1, "Stack is required")
  .refine((value) => /^\d+$/.test(value), {
    message: "Stack must be a whole number",
  })
  .refine((value) => Number(value) > 0, {
    message: "Stack must be greater than 0",
  })
  .refine((value) => Number.isSafeInteger(Number(value)), {
    message: "Stack is too large",
  });

/**
 * Payout được giữ dưới dạng string trong form.
 * Payout có thể bằng 0 nhưng không được âm.
 */
const payoutAmountSchema = z
  .string()
  .trim()
  .min(1, "Payout is required")
  .refine((value) => Number.isFinite(Number(value)), {
    message: "Payout must be a valid number",
  })
  .refine((value) => Number(value) >= 0, {
    message: "Payout cannot be negative",
  });

/**
 * Dữ liệu của một người chơi.
 */
const playerSchema = z.object({
  seat: z
    .number()
    .int("Seat must be a whole number")
    .min(1, "Seat must be at least 1")
    .max(10, "Seat cannot be greater than 10"),

  stack: stackSchema,
});

/**
 * Dữ liệu tiền thưởng của một vị trí.
 */
const payoutSchema = z.object({
  place: z
    .number()
    .int()
    .min(1)
    .max(10),

  amount: payoutAmountSchema,
});

/**
 * Schema chính của toàn bộ form.
 */
export const icmFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Calculation title is required")
      .max(100, "Calculation title is too long"),

    players: z
      .array(playerSchema)
      .min(2, "At least 2 players are required")
      .max(10, "A maximum of 10 players is supported"),

    payouts: z
      .array(payoutSchema)
      .min(2, "At least 2 payout positions are required")
      .max(10, "A maximum of 10 payout positions is supported"),
  })
  .superRefine((data, context) => {
    /**
     * Số payout phải bằng số player.
     */
    if (data.players.length !== data.payouts.length) {
      context.addIssue({
        code: "custom",
        path: ["payouts"],
        message: "The number of payouts must match the number of players",
      });
    }

    /**
     * Không cho phép hai người chơi có cùng seat.
     */
    const usedSeats = new Set<number>();

    data.players.forEach((player, index) => {
      if (usedSeats.has(player.seat)) {
        context.addIssue({
          code: "custom",
          path: ["players", index, "seat"],
          message: "Seat must be unique",
        });
      }

      usedSeats.add(player.seat);
    });

    /**
     * Place phải chạy liên tục từ 1 đến số player.
     */
    data.payouts.forEach((payout, index) => {
      const expectedPlace = index + 1;

      if (payout.place !== expectedPlace) {
        context.addIssue({
          code: "custom",
          path: ["payouts", index, "place"],
          message: `Place must be ${expectedPlace}`,
        });
      }
    });

    /**
     * Payout phải giảm dần hoặc bằng nhau.
     */
    for (let index = 1; index < data.payouts.length; index += 1) {
      const previousPayout = Number(
        data.payouts[index - 1].amount,
      );

      const currentPayout = Number(
        data.payouts[index].amount,
      );

      if (currentPayout > previousPayout) {
        context.addIssue({
          code: "custom",
          path: ["payouts", index, "amount"],
          message: "A lower place cannot have a higher payout",
        });
      }
    }

    /**
     * Tổng prize pool phải lớn hơn 0.
     */
    const totalPrize = data.payouts.reduce(
      (total, payout) => total + Number(payout.amount),
      0,
    );

    if (totalPrize <= 0) {
      context.addIssue({
        code: "custom",
        path: ["payouts"],
        message: "Total prize pool must be greater than 0",
      });
    }
  });

/**
 * TypeScript type tự động được tạo từ Zod schema.
 */
export type IcmFormValues = z.infer<typeof icmFormSchema>;

/**
 * Dữ liệu mặc định khi người dùng mở calculator.
 */
export const defaultIcmFormValues: IcmFormValues = {
  title: "Final Table ICM",

  players: [
    {
      seat: 1,
      stack: "",
    },
    {
      seat: 2,
      stack: "",
    },
    {
      seat: 3,
      stack: "",
    },
  ],

  payouts: [
    {
      place: 1,
      amount: "",
    },
    {
      place: 2,
      amount: "",
    },
    {
      place: 3,
      amount: "",
    },
  ],
};